const fs = require('fs');

// ── content.js ────────────────────────────────────────────────
let content = fs.readFileSync('backend/routes/content.js', 'utf8');

content = content.replace(
  `const db = require('../config/database');\nconst cache = require('../middleware/cache');`,
  `const db = require('../config/database');\nconst cache = require('../middleware/cache');\nconst { validate, contentSchema } = require('../validators');\nconst { success, error } = require('../utils/responseHelper');`
);

// GET all
content = content.replace(
  `res.json({ success: true, content: rows });`,
  `return success(res, { content: rows });`
);
content = content.replace(
  `res.status(500).json({ success: false, error: 'Failed to fetch content' });`,
  `return error(res, 'Failed to fetch content');`
);

// GET single
content = content.replace(
  `return res.status(404).json({ success: false, error: 'Content not found' });`,
  `return error(res, 'Content not found', 404);`
);
content = content.replace(
  `res.json({ success: true, content: rows[0] });`,
  `return success(res, { content: rows[0] });`
);

// CREATE
content = content.replace(
  `router.post('/', async (req, res) => {`,
  `router.post('/', validate(contentSchema), async (req, res) => {`
);
content = content.replace(
  `    if (!title) {\n      return res.status(400).json({ success: false, error: 'Title is required' });\n    }\n`,
  ''
);
content = content.replace(
  `    cache.invalidate('/api/content');\n    res\n      .status(201)\n      .json({ success: true, message: 'Content created successfully', id: result.insertId });`,
  `    cache.invalidate('/api/content');\n    return success(res, { message: 'Content created successfully', id: result.insertId }, 201);`
);

// UPDATE
content = content.replace(
  `router.put('/:id', async (req, res) => {`,
  `router.put('/:id', validate(contentSchema), async (req, res) => {`
);
content = content.replace(
  `      return res.status(404).json({ success: false, error: 'Content not found' });`,
  `      return error(res, 'Content not found', 404);`
);
content = content.replace(
  `    cache.invalidate('/api/content');\n    res.json({ success: true, message: 'Content updated successfully' });`,
  `    cache.invalidate('/api/content');\n    return success(res, { message: 'Content updated successfully' });`
);

// DELETE
content = content.replace(
  `      return res.status(404).json({ success: false, error: 'Content not found' });\n\n    cache.invalidate`,
  `      return error(res, 'Content not found', 404);\n\n    cache.invalidate`
);
content = content.replace(
  `    res.json({ success: true, message: 'Content deleted successfully' });`,
  `    return success(res, { message: 'Content deleted successfully' });`
);

fs.writeFileSync('backend/routes/content.js', content);
console.log('content.js updated');
