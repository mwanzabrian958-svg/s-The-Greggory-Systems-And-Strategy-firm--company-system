const fs = require('fs');

// ── contact-forms.js ──────────────────────────────────────────
let content = fs.readFileSync('backend/routes/contact-forms.js', 'utf8');

content = content.replace(
  `const db = require('../config/database');\nconst { createNotification } = require('../utils/notificationHelper');`,
  `const db = require('../config/database');\nconst { createNotification } = require('../utils/notificationHelper');\nconst { validate, contactFormSchema } = require('../validators');\nconst { success, error } = require('../utils/responseHelper');`
);

// GET all
content = content.replace(
  `    res.json(rows);`,
  `    return success(res, { data: rows });`
);

// GET single
content = content.replace(
  `      return res.status(404).json({ error: 'Contact form not found' });\n    }\n\n    res.json(rows[0]);`,
  `      return error(res, 'Contact form not found', 404);\n    }\n\n    return success(res, { data: rows[0] });`
);

// CREATE
content = content.replace(
  `router.post('/', async (req, res) => {`,
  `router.post('/', validate(contactFormSchema), async (req, res) => {`
);
content = content.replace(
  `    if (!name || !email || !message) {\n      return res.status(400).json({ error: 'Name, email and message are required' });\n    }\n`,
  ''
);
content = content.replace(
  `    res.status(201).json({ message: 'Contact form submitted successfully', id: result.insertId });`,
  `    return success(res, { message: 'Contact form submitted successfully', id: result.insertId }, 201);`
);

// DELETE
content = content.replace(
  `      return res.status(404).json({ error: 'Contact form not found' });\n    }\n\n    res.json({ message:`,
  `      return error(res, 'Contact form not found', 404);\n    }\n\n    return success(res, { message:`
);
content = content.replace(
  `    res.json({ message: 'Contact form deleted successfully' });`,
  `    return success(res, { message: 'Contact form deleted successfully' });`
);

// Error responses
content = content.replace(
  `res.status(500).json({ error: 'Failed to fetch contact forms' });`,
  `return error(res, 'Failed to fetch contact forms');`
);
content = content.replace(
  `res.status(500).json({ error: 'Failed to fetch contact form' });`,
  `return error(res, 'Failed to fetch contact form');`
);
content = content.replace(
  `res.status(500).json({ error: 'Failed to submit contact form' });`,
  `return error(res, 'Failed to submit contact form');`
);
content = content.replace(
  `res.status(500).json({ error: 'Failed to delete contact form' });`,
  `return error(res, 'Failed to delete contact form');`
);

fs.writeFileSync('backend/routes/contact-forms.js', content);
console.log('contact-forms.js updated');

// ── management.js ─────────────────────────────────────────────
content = fs.readFileSync('backend/routes/management.js', 'utf8');

content = content.replace(
  `const db = require('../config/database');\nconst requireAdmin = require('../middleware/auth');`,
  `const db = require('../config/database');\nconst requireAdmin = require('../middleware/auth');\nconst { validate, managementSchema } = require('../validators');\nconst { success, error } = require('../utils/responseHelper');`
);

// GET
content = content.replace(
  `      console.error('Error fetching management info:', err);\n      return res.status(500).json({ error: 'Failed to fetch management info' });`,
  `      console.error('Error fetching management info:', err);\n      return error(res, 'Failed to fetch management info');`
);
content = content.replace(
  `    res.json(results[0]);`,
  `    return success(res, results[0]);`
);

// UPDATE
content = content.replace(
  `router.put('/:companyId', requireAdmin, (req, res) => {`,
  `router.put('/:companyId', requireAdmin, validate(managementSchema), (req, res) => {`
);
content = content.replace(
  `        return res.status(500).json({ error: 'Failed to update management info' });`,
  `        return error(res, 'Failed to update management info');`
);
content = content.replace(
  `      res.json({ message: 'Management info updated successfully' });`,
  `      return success(res, { message: 'Management info updated successfully' });`
);

fs.writeFileSync('backend/routes/management.js', content);
console.log('management.js updated');
