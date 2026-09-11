const fs = require('fs');

// ── user-projects.js ──────────────────────────────────────────
let content = fs.readFileSync('backend/routes/user-projects.js', 'utf8');

content = content.replace(
  `const db = require('../config/database');\nconst { createNotification } = require('../utils/notificationHelper');`,
  `const db = require('../config/database');\nconst { createNotification } = require('../utils/notificationHelper');\nconst { validate, projectSchema } = require('../validators');\nconst { success, error } = require('../utils/responseHelper');`
);

// GET all
content = content.replace(
  `    res.json(rows);`,
  `    return success(res, { data: rows });`
);

// GET single
content = content.replace(
  `      return res.status(404).json({ error: 'Project not found' });\n    }\n\n    res.json(rows[0]);`,
  `      return error(res, 'Project not found', 404);\n    }\n\n    return success(res, { data: rows[0] });`
);

// CREATE
content = content.replace(
  `router.post('/', async (req, res) => {`,
  `router.post('/', validate(projectSchema), async (req, res) => {`
);
content = content.replace(
  `    if (!user_id || !project_name) {\n      return res.status(400).json({ error: 'User ID and project name are required' });\n    }\n`,
  ''
);
content = content.replace(
  `    res.status(201).json({ message: 'Project created successfully', id: result.insertId });`,
  `    return success(res, { message: 'Project created successfully', id: result.insertId }, 201);`
);

// UPDATE
content = content.replace(
  `router.put('/:id', async (req, res) => {`,
  `router.put('/:id', validate(projectSchema), async (req, res) => {`
);
content = content.replace(
  `      return res.status(404).json({ error: 'Project not found' });`,
  `      return error(res, 'Project not found', 404);`
);
content = content.replace(
  `    res.json({ message: 'Project updated successfully' });`,
  `    return success(res, { message: 'Project updated successfully' });`
);

// DELETE
content = content.replace(
  `      return res.status(404).json({ error: 'Project not found' });\n    }\n\n    res.json({ message:`,
  `      return error(res, 'Project not found', 404);\n    }\n\n    return success(res, { message:`
);
content = content.replace(
  `    res.json({ message: 'Project deleted successfully' });`,
  `    return success(res, { message: 'Project deleted successfully' });`
);

// Fix error responses
content = content.replace(
  /res\.status\(500\)\.json\(\{\s*error:\s*'Failed to fetch user projects'\s*\}\);/g,
  `return error(res, 'Failed to fetch user projects');`
);
content = content.replace(
  /res\.status\(500\)\.json\(\{\s*error:\s*'Failed to fetch user project'\s*\}\);/g,
  `return error(res, 'Failed to fetch user project');`
);
content = content.replace(
  /res\.status\(500\)\.json\(\{\s*error:\s*'Failed to create user project'\s*\}\);/g,
  `return error(res, 'Failed to create user project');`
);
content = content.replace(
  /res\.status\(500\)\.json\(\{\s*error:\s*'Failed to update user project'\s*\}\);/g,
  `return error(res, 'Failed to update user project');`
);
content = content.replace(
  /res\.status\(500\)\.json\(\{\s*error:\s*'Failed to delete user project'\s*\}\);/g,
  `return error(res, 'Failed to delete user project');`
);

fs.writeFileSync('backend/routes/user-projects.js', content);
console.log('user-projects.js updated');
