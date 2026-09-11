const express = require('express');
const router = express.Router();
const { initiateSTKPush } = require('../services/mpesaService');
const db = require('../config/database');
const { validate, mpesaStkSchema, mpesaRecordSchema } = require('../validators');
const { success, error } = require('../utils/responseHelper');

/**
 * Trigger STK Push
 * POST /api/mpesa/stkpush
 *
 * @swagger
 * /api/mpesa/stkpush:
 *   post:
 *     summary: Initiate an M-Pesa STK Push payment
 *     tags: [M-Pesa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, amount]
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: Phone number in 2547XXXXXXXX format
 *               amount:
 *                 type: number
 *                 description: Transaction amount in KES
 *               account_reference:
 *                 type: string
 *                 description: Account reference (default: GSS-FIRM)
 *               transaction_desc:
 *                 type: string
 *                 description: Transaction description (default: Consultancy Payment)
 *     responses:
 *       200:
 *         description: STK Push initiated successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: M-Pesa STK Push failed
 */
router.post('/stkpush', validate(mpesaStkSchema), async (req, res) => {
  try {
    const { phone_number, amount, account_reference, transaction_desc } = req.body;

    const result = await initiateSTKPush(
      phone_number,
      amount,
      account_reference || 'GSS-FIRM',
      transaction_desc || 'Consultancy Payment',
    );

    if (result.success) {
      let created_by = Number(req.body.user_id) || null;
      if (!created_by) {
        try {
          const [u] = await db.promise().query('SELECT id FROM users ORDER BY id LIMIT 1');
          created_by = u?.[0]?.id ?? null;
        } catch (_) {
          /* leave null */
        }
      }

      try {
        await db.promise().query(
          `INSERT INTO mpesa_transactions (
            transaction_id, amount, phone_number, account_reference,
            status, response_data, created_by, created_at
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())`,
          [
            result.CheckoutRequestID,
            amount,
            phone_number,
            account_reference || 'GSS-FIRM',
            JSON.stringify(result),
            created_by,
          ],
        );
      } catch (dbErr) {
        console.warn('[MPESA] Failed to log pending transaction:', dbErr.message);
      }

      return success(res, {
        message: result.simulated
          ? 'Simulation: STK Push initialized'
          : 'STK Push sent to your phone',
        checkout_request_id: result.CheckoutRequestID,
        simulated: result.simulated,
      });
    }
    return error(
      res,
      result.errorMessage || result.ResponseDescription || 'M-Pesa STK Push failed',
      500,
    );
  } catch (err) {
    console.error('[MPESA STKPUSH] Error:', err);
    return error(res, 'Server error during STK Push');
  }
});

/**
 * M-Pesa Callback (Safaricom calls this)
 * POST /api/mpesa/callback
 *
 * @swagger
 * /api/mpesa/callback:
 *   post:
 *     summary: M-Pesa STK Push callback (Safaricom)
 *     tags: [M-Pesa]
 *     description: Called by Safaricom's M-Pesa API to notify the result of an STK Push transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Body:
 *                 type: object
 *                 properties:
 *                   stkCallback:
 *                     type: object
 *                     properties:
 *                       CheckoutRequestID:
 *                         type: string
 *                       ResultCode:
 *                         type: integer
 *                       ResultDesc:
 *                         type: string
 *                       CallbackMetadata:
 *                         type: object
 *                         properties:
 *                           Item:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 Name:
 *                                   type: string
 *                                 Value:
 *                                   type: string
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *       500:
 *         description: Internal server error
 */
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body.stkCallback;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log(
      `[MPESA CALLBACK] Received for ${checkoutRequestId}: ${resultDesc} (${resultCode})`,
    );

    const status = resultCode === 0 ? 'completed' : 'failed';
    let mpesaReceiptNumber = null;

    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const receiptItem = callbackMetadata.find((item) => item.Name === 'MpesaReceiptNumber');
      mpesaReceiptNumber = receiptItem ? receiptItem.Value : null;
    }

    await db.promise().query(
      `UPDATE mpesa_transactions
       SET status = ?, result_code = ?, result_desc = ?, mpesa_receipt = ?, updated_at = NOW()
       WHERE transaction_id = ?`,
      [status, resultCode, resultDesc, mpesaReceiptNumber, checkoutRequestId],
    );

    if (status === 'completed') {
      try {
        const [txRows] = await db
          .promise()
          .query(
            'SELECT project_id, amount, phone_number, account_reference, client_id FROM mpesa_transactions WHERE transaction_id = ?',
            [checkoutRequestId],
          );

        if (txRows.length > 0) {
          const tx = txRows[0];
          await db.promise().query(
            `INSERT INTO accounting_entries (
              project_id, entry_type, category, amount, currency,
              transaction_date, transaction_reference, payment_method,
              payment_status, description, created_by, created_at
            ) VALUES (?, 'invoice_payment', 'Revenue', ?, 'KES', NOW(), ?, 'online_payment', 'completed', ?, ?, NOW())`,
            [
              tx.project_id,
              tx.amount,
              mpesaReceiptNumber || checkoutRequestId,
              `M-Pesa Payment from ${tx.phone_number} (Ref: ${tx.account_reference})`,
              tx.client_id || 1,
            ],
          );
          console.log(`[MPESA] Ledger Entry Created for transaction ${checkoutRequestId}`);
        }
      } catch (ledgerErr) {
        console.error('[MPESA] Failed to create Ledger Entry:', ledgerErr.message);
      }
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('[MPESA CALLBACK] Error:', err);
    return res.status(500).json({ ResultCode: 1, ResultDesc: 'Internal Server Error' });
  }
});

/**
 * Check Transaction Status
 * GET /api/mpesa/status/:checkoutRequestId
 *
 * @swagger
 * /api/mpesa/status/{checkoutRequestId}:
 *   get:
 *     summary: Check the status of an M-Pesa transaction
 *     tags: [M-Pesa]
 *     parameters:
 *       - in: path
 *         name: checkoutRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The CheckoutRequestID from the STK Push
 *     responses:
 *       200:
 *         description: Transaction status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 result_desc:
 *                   type: string
 *                 mpesa_receipt:
 *                   type: string
 *       404:
 *         description: Transaction not found
 */
router.get('/status/:checkoutRequestId', async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const [rows] = await db
      .promise()
      .query(
        'SELECT status, result_desc, mpesa_receipt FROM mpesa_transactions WHERE transaction_id = ?',
        [checkoutRequestId],
      );

    if (rows.length === 0) {
      return error(res, 'Transaction not found', 404);
    }

    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
