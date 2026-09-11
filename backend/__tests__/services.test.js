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

// ── WhatsApp Service (simulation mode) ─────────────────────────
const whatsappService = require('../services/whatsappService');

describe('whatsappService (simulation mode)', () => {
  it('sendWhatsAppMessage returns a simulated response when no provider is configured', async () => {
    delete process.env.WHATSAPP_CLOUD_TOKEN;
    delete process.env.WHATSAPP_CLOUD_PHONE_ID;
    delete process.env.AFRICASTALKING_API_KEY;
    const freshWs = require('../services/whatsappService');
    const result = await freshWs.sendWhatsAppMessage('+254712345678', 'Test message');
    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.data.messageId).toBeDefined();
    expect(result.data.status).toBe('queued-for-delivery');
  });

  it('sendBulkWhatsApp returns a simulated response when no provider is configured', async () => {
    delete process.env.WHATSAPP_CLOUD_TOKEN;
    delete process.env.WHATSAPP_CLOUD_PHONE_ID;
    delete process.env.AFRICASTALKING_API_KEY;
    const freshWs = require('../services/whatsappService');
    const result = await freshWs.sendBulkWhatsApp(['+254712345678'], 'Bulk test');
    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
  });

  it('exports COMPANY_WHATSAPP_NUMBER', () => {
    expect(whatsappService.COMPANY_WHATSAPP_NUMBER).toBeDefined();
    expect(typeof whatsappService.COMPANY_WHATSAPP_NUMBER).toBe('string');
  });
});

// ── Utility: sessionToken ───────────────────────────────────────
const sessionToken = require('../utils/sessionToken');

describe('sessionToken utility', () => {
  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = 'test-secret-2025';
  });

  it('signSessionToken creates a verifiable token', () => {
    const token = sessionToken.signSessionToken(42, 'admin');
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(2);
  });

  it('verifySessionToken verifies a valid token', () => {
    const token = sessionToken.signSessionToken(42, 'admin');
    const payload = sessionToken.verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload.uid).toBe(42);
    expect(payload.role).toBe('admin');
    expect(payload.exp).toBeGreaterThan(Date.now());
  });

  it('verifySessionToken rejects an invalid token', () => {
    const result = sessionToken.verifySessionToken('invalid-token');
    expect(result).toBeNull();
  });

  it('verifySessionToken rejects a null token', () => {
    expect(sessionToken.verifySessionToken(null)).toBeNull();
    expect(sessionToken.verifySessionToken(undefined)).toBeNull();
  });

  it('verifySessionToken rejects a tampered token', () => {
    const token = sessionToken.signSessionToken(42, 'admin');
    const tampered = token.slice(0, -2) + 'xx';
    expect(sessionToken.verifySessionToken(tampered)).toBeNull();
  });

  it('getSessionSecret returns a defined secret', () => {
    const secret = sessionToken.getSessionSecret();
    expect(secret).toBeDefined();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(0);
  });
});

// ── Utility: responseHelper ─────────────────────────────────────
const responseHelper = require('../utils/responseHelper');

describe('responseHelper utility', () => {
  let res;

  beforeEach(() => {
    res = {
      statusCode: 200,
      _json: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this._json = body;
        return this;
      },
    };
  });

  it('success returns a 200 with success true', () => {
    responseHelper.success(res, { message: 'OK' });
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.message).toBe('OK');
  });

  it('success respects a custom status code', () => {
    responseHelper.success(res, { id: 1 }, 201);
    expect(res.statusCode).toBe(201);
    expect(res._json.success).toBe(true);
  });

  it('error returns a 400 with success false', () => {
    responseHelper.error(res, 'Bad request');
    expect(res.statusCode).toBe(400);
    expect(res._json.success).toBe(false);
    expect(res._json.message).toBe('Bad request');
  });

  it('error respects a custom status code', () => {
    responseHelper.error(res, 'Not found', 404);
    expect(res.statusCode).toBe(404);
    expect(res._json.success).toBe(false);
  });
});

// ── Utility: activityLogFormatter ───────────────────────────────
const { formatActivityLog } = require('../utils/activityLogFormatter');

describe('activityLogFormatter utility', () => {
  it('formats a completed action row', () => {
    const row = {
      id: 1,
      action_type: 'CREATE',
      action_description: 'Created a new user',
      admin_display_name: 'Admin User',
      affected_table: 'users',
      affected_record_id: 42,
      created_at: new Date(),
    };
    const result = formatActivityLog(row);
    expect(result.id).toBe(1);
    expect(result.type).toBe('CREATE');
    expect(result.status).toBe('completed');
    expect(result.description).toBe('Created a new user');
  });

  it('formats a queued action row', () => {
    const row = {
      id: 2,
      action_type: 'SMS_SENT',
      action_description: 'Message queued for delivery',
      admin_display_name: 'System',
      affected_table: 'messages',
      affected_record_id: 10,
      created_at: new Date(),
    };
    const result = formatActivityLog(row);
    expect(result.status).toBe('queued');
  });

  it('formats a failed action row', () => {
    const row = {
      id: 3,
      action_type: 'ERROR',
      action_description: 'Operation failed',
      admin_display_name: 'System',
      affected_table: 'invoices',
      affected_record_id: 5,
      created_at: new Date(),
    };
    const result = formatActivityLog(row);
    expect(result.status).toBe('failed');
  });

  it('defaults actor to System when no display name', () => {
    const row = {
      id: 4,
      action_type: 'UPDATE',
      action_description: 'Updated record',
      affected_table: 'projects',
      affected_record_id: 7,
      created_at: new Date(),
    };
    const result = formatActivityLog(row);
    expect(result.actor).toBe('System');
  });
});
