const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  role: z.string().optional(),
});

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  author: z.string().max(100).optional(),
  read_time: z.string().optional(),
  category: z.string().max(100).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  client_id: z.number().positive().optional(),
  status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
  budget: z.number().positive().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// ── Admin routes ──────────────────────────────────────────────
const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  role: z.string().min(1, 'Role is required').max(50),
  admin_level: z.string().max(50).optional(),
});

const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.string().max(50).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended'], {
    required_error: 'Status is required',
  }),
});

const crmContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  status: z.enum(['lead', 'prospect', 'client', 'inactive']).optional(),
  notes: z.string().max(2000).optional(),
});

const settingsSchema = z.object({
  site_name: z.string().max(200).optional(),
  site_description: z.string().max(500).optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional(),
  maintenance_mode: z.boolean().optional(),
});

const reportSchema = z.object({
  project_id: z.number().positive().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  summary: z.string().max(2000).optional(),
  file_type: z.string().max(50).optional(),
  file_name: z.string().max(255).optional(),
  file_size: z.number().positive().optional(),
  admin_id: z.number().positive().optional(),
});

// ── M-Pesa routes ─────────────────────────────────────────────
const mpesaStkSchema = z.object({
  phone_number: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
  amount: z.number().positive('Amount must be greater than 0'),
  account_reference: z.string().max(100).optional(),
  transaction_desc: z.string().max(200).optional(),
});

const mpesaRecordSchema = z.object({
  mpesa_receipt: z.string().min(1, 'M-Pesa receipt is required').max(50),
  phone_number: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
  amount: z.number().positive('Amount must be greater than 0'),
  transaction_id: z.string().max(100).optional(),
  client_id: z.number().positive().optional(),
  client_name: z.string().max(200).optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  project_id: z.number().positive().optional(),
  invoice_id: z.number().positive().optional(),
  company_id: z.number().positive().optional(),
  account_reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// ── SMS routes ────────────────────────────────────────────────
const smsSendSchema = z.object({
  phone_number: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
});

const smsBulkSchema = z.object({
  user_ids: z.array(z.number().positive()).min(1, 'At least one user ID required'),
  message: z.string().min(1, 'Message is required').max(1600),
});

// ── WhatsApp routes ───────────────────────────────────────────
const whatsappSendSchema = z.object({
  phone_number: z.string().regex(/^254\d{9}$/, 'Phone must be in format 254XXXXXXXXX'),
  message: z.string().min(1, 'Message is required').max(4096, 'Message too long'),
});

const whatsappBulkSchema = z.object({
  user_ids: z.array(z.number().positive()).min(1, 'At least one user ID required'),
  message: z.string().min(1, 'Message is required').max(4096),
});

// ── Content routes ────────────────────────────────────────────
const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(['page', 'post', 'article', 'faq']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  author: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  tags: z.string().max(500).optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
});

// ── Contact form routes ───────────────────────────────────────
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email format'),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
  department: z.string().max(100).optional(),
});

// ── Management routes ─────────────────────────────────────────
const managementSchema = z.object({
  station_manager: z.string().max(200).optional(),
  service_area: z.string().max(500).optional(),
  base_location: z.string().max(500).optional(),
  updated_by: z.number().positive().optional(),
});

// ── Notification routes ───────────────────────────────────────
const notificationSchema = z.object({
  user_id: z.number().positive('User ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required').max(2000),
  type: z.enum(['info', 'warning', 'success', 'error']).optional(),
  action_url: z.string().max(500).optional(),
});

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      // zod v3 uses `errors`, zod v4 uses `issues`
      if (error instanceof z.ZodError) {
        const details = error.errors ?? error.issues ?? [];
        const messages = details.map((e) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages,
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
  };
}

module.exports = {
  loginSchema,
  resetPasswordSchema,
  registerSchema,
  blogSchema,
  projectSchema,
  createAdminSchema,
  updateUserSchema,
  updateStatusSchema,
  crmContactSchema,
  settingsSchema,
  reportSchema,
  mpesaStkSchema,
  mpesaRecordSchema,
  smsSendSchema,
  smsBulkSchema,
  whatsappSendSchema,
  whatsappBulkSchema,
  contentSchema,
  contactFormSchema,
  managementSchema,
  notificationSchema,
  validate,
};
