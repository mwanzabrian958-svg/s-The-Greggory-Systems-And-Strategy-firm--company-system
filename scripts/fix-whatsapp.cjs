const fs = require('fs');
const file = 'backend/routes/whatsapp.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  `const db = require('../config/database');`,
  `const db = require('../config/database');\nconst { validate, whatsappBulkSchema, z } = require('../validators');\nconst { success, error } = require('../utils/responseHelper');`
);

// 2. Update authenticateUser to use response helper
content = content.replace(
  `    return res.status(401).json({ success: false, message: 'Authentication required' });`,
  `    return error(res, 'Authentication required', 401);`
);
content = content.replace(
  `    return res\n      .status(401)\n      .json({ success: false, message: 'Invalid or expired authentication token' });`,
  `    return error(res, 'Invalid or expired authentication token', 401);`
);

// 3. Add message schema
content = content.replace(
  `// Health check`,
  `const messageSchema = z.object({\n  message: z.string().min(1, 'Message is required').max(4096, 'Message too long'),\n});\n\n// Health check`
);

// 4. Update health check
content = content.replace(
  `  res.json({\n    success: true,\n    message: 'WhatsApp router is working',\n    companyPhone: COMPANY_WHATSAPP_NUMBER,\n  });`,
  `  success(res, { message: 'WhatsApp router is working', company_phone: COMPANY_WHATSAPP_NUMBER });`
);

// 5. Add validation to send route
content = content.replace(
  `router.post('/send', authenticateUser, async (req, res) => {`,
  `router.post('/send', authenticateUser, validate(messageSchema), async (req, res) => {`
);

// 6. Remove manual validation
content = content.replace(
  `    if (!userId || !message) {\n      return res.status(400).json({\n        success: false,\n        message: 'User ID and message are required',\n      });\n    }\n\n    // Get user's phone number from database`,
  ''
);

// 7. Replace user not found
content = content.replace(
  /return res\.status\(404\)\.json\(\{\n        success: false,\n        message: 'User not found',\n      \}\);/g,
  `return error(res, 'User not found', 404);`
);

// 8. Replace phone number missing
content = content.replace(
  /return res\.status\(400\)\.json\(\{\n        success: false,\n        message: 'You do not have a phone number registered\. Please update your profile\.',\n      \}\);/g,
  `return error(res, 'You do not have a phone number registered. Please update your profile.');`
);

fs.writeFileSync(file, content);
console.log('WhatsApp route part 1 updated');
