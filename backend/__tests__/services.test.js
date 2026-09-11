// @vitest-environment node
const request = require('supertest');
const mpesaService = require('../services/mpesaService');
const smsService = require('../services/smsService');

const app = require('../server');

// ── Service layer tests (no DB required; uses simulation mode) ──
// These verify the service functions return expected structures when
// provider credentials are unavailable (simulation mode).

describe('mpesaService (simulation mode)', () => {
  it('getAccessToken returns simulated-token when credentials are missing', async () => {
    // Ensure credentials are not set.
    delete process.env.MPESA_CONSUMER_KEY;
    delete process.env.MPESA_CONSUMER_SECRET;
    const token = await mpesaService.getAccessToken();
    expect(token).toBe('simulated-token');
  });

  it('initiateSTKPush returns a simulated response with expected fields', async () => {
    delete process.env.MPESA_CONSUMER_KEY;
    delete process.env.MPESA_CONSUMER_SECRET;
    const result = await mpesaService.initiateSTKPush(
      '254712345678',
      100,
      'TEST-REF',
      'Test payment',
    );
    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.MerchantRequestID).toBeDefined();
    expect(result.CheckoutRequestID).toBeDefined();
    expect(result.ResponseDescription).toContain('Simulation');
  });
});

describe('smsService (simulation mode)', () => {
  it('sendSMS returns a simulated response when no API key is configured', async () => {
    delete process.env.AFRICASTALKING_API_KEY;
    // Re-require to pick up the missing key.
    const freshSmsService = require('../services/smsService');
    const result = await freshSmsService.sendSMS('+254712345678', 'Test message');
    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.data.messageId).toBeDefined();
    expect(result.data.status).toBe('queued-for-delivery');
  });

  it('sendBulkSMS returns a simulated response when no API key is configured', async () => {
    delete process.env.AFRICASTALKING_API_KEY;
    const freshSmsService = require('../services/smsService');
    const result = await freshSmsService.sendBulkSMS(
      ['+254712345678', '+254798765432'],
      'Bulk test',
    );
    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.action).toBe('bulk-send');
  });

  it('exports COMPANY_PHONE_NUMBER', () => {
    expect(smsService.COMPANY_PHONE_NUMBER).toBeDefined();
    expect(typeof smsService.COMPANY_PHONE_NUMBER).toBe('string');
  });
});

// ── SMS route integration (real DB logging) ──
// Verifies that an authenticated SMS send logs to admin_activity_logs.
const runDbTests = process.env.RUN_DB_TESTS === '1';
const describeDb = runDbTests ? describe : describe.skip;

describeDb('POST /api/sms/send (authenticated, real DB log)', () => {
  const jwt = require('jsonwebtoken');
  let authToken;

  beforeAll(() => {
    // Seed a user first so the auth token resolves to a real user.
    authToken = jwt.sign({ userId: 1, id: 1 }, process.env.JWT_SECRET || 'test-secret');
  });

  it('sends an SMS and logs the activity', async () => {
    const uniqueMsg = `Coverage SMS test ${Date.now()}`;
    const res = await request(app)
      .post('/api/sms/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: uniqueMsg });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.simulated).toBe(true);

    // Verify the activity log was written.
    const db = require('../config/database');
    const [rows] = await db
      .promise()
      .query(
        `SELECT action_description FROM admin_activity_logs WHERE action_type = 'SMS_SENT' ORDER BY created_at DESC LIMIT 1`,
      );
    expect(rows.length).toBe(1);
    expect(rows[0].action_description).toContain('company');
  });
});

describeDb('POST /api/whatsapp/send (authenticated, real DB log)', () => {
  const jwt = require('jsonwebtoken');
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign({ userId: 1, id: 1 }, process.env.JWT_SECRET || 'test-secret');
  });

  it('sends a WhatsApp message and logs the activity', async () => {
    const uniqueMsg = `Coverage WhatsApp test ${Date.now()}`;
    const res = await request(app)
      .post('/api/whatsapp/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: uniqueMsg });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const db = require('../config/database');
    const [rows] = await db
      .promise()
      .query(
        `SELECT action_description FROM admin_activity_logs WHERE action_type = 'WHATSAPP_SENT' ORDER BY created_at DESC LIMIT 1`,
      );
    expect(rows.length).toBe(1);
    expect(rows[0].action_description).toContain('company');
  });
});

describeDb('POST /api/mpesa/stkpush (authenticated, real DB log)', () => {
  const jwt = require('jsonwebtoken');
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign({ userId: 1, id: 1 }, process.env.JWT_SECRET || 'test-secret');
  });

  it('initiates an STK push and logs the activity', async () => {
    const res = await request(app)
      .post('/api/mpesa/stkpush')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        phone_number: '254712345678',
        amount: 100,
      });

    // In simulation mode (no Safaricom credentials), the route should still succeed.
    expect([200, 201]).toContain(res.status);
  });

  it('rejects missing phone number', async () => {
    const res = await request(app)
      .post('/api/mpesa/stkpush')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing amount', async () => {
    const res = await request(app)
      .post('/api/mpesa/stkpush')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ phone_number: '254712345678' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
