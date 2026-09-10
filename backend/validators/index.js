const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
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
  registerSchema,
  blogSchema,
  projectSchema,
  validate,
};
