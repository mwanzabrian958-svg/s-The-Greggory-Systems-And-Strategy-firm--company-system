const fs = require('fs');
const file = 'backend/routes/whatsapp.js';
let content = fs.readFileSync(file, 'utf8');

// 9. Replace success response
content = content.replace(
  /      const simulated = Boolean\(whatsappResult\?\.data\?\.simulated\);\n      res\.json\(\{\n        success: true,\n        message: simulated\n          \? 'WhatsApp message queued for delivery to company'\n          : 'WhatsApp message sent successfully to company',\n        from: user\.phone_number,\n        to: COMPANY_WHATSAPP_NUMBER,\n        simulated,\n        relay: simulated \? 'queued' : 'sent',\n      \}\);/g,
  `      const simulated = Boolean(whatsappResult?.data?.simulated);
      return success(res, {
        message: simulated ? 'WhatsApp message queued for delivery to company' : 'WhatsApp message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_WHATSAPP_NUMBER,
        simulated,
        relay: simulated ? 'queued' : 'sent',
      });`
);

// 10. Replace failure response
content = content.replace(
  /    \} else \{\n      res\.status\(500\)\.json\(\{\n        success: false,\n        message: 'Failed to send WhatsApp message',\n        error: whatsappResult\.error,\n      \}\);\n    \}/g,
  `    return error(res, 'Failed to send WhatsApp message');`
);

// 11. Replace catch block
content = content.replace(
  /  \} catch \(error\) \{\n    console\.error\('\[WHATSAPP SEND\] Error:', error\);\n    res\.status\(500\)\.json\(\{\n      success: false,\n      message: 'Error sending WhatsApp message',\n      error: error\.message,\n    \}\);\n  \}/g,
  `  } catch (err) {
    console.error('[WHATSAPP SEND] Error:', err);
    return error(res, 'Error sending WhatsApp message');
  }`
);

// 12. Remove comments
content = content.replace("    // Send WhatsApp message FROM user TO company number\n", '');
content = content.replace("        // Log the WhatsApp message sent\n", '');

// 13. Replace log error catch
content = content.replace(
  /      \} catch \(logError\) \{\n        console\.warn\(\n          '\[WHATSAPP SEND\] Activity log insert failed, continuing with relay success:',\n          logError\.message,\n        \);\n      \}/g,
  `      } catch (logError) {
        console.warn('[WHATSAPP SEND] Activity log insert failed:', logError.message);
      }`
);

// 14. Add validation to send-bulk route
content = content.replace(
  `router.post('/send-bulk', async (req, res) => {`,
  `router.post('/send-bulk', validate(whatsappBulkSchema), async (req, res) => {`
);

// 15. Remove manual validation in bulk
content = content.replace(
  `    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {\n      return res.status(400).json({\n        success: false,\n        message: 'User IDs array and message are required',\n      });\n    }\n\n    // Get all users' phone numbers`,
  ''
);

// 16. Replace bulk user not found
content = content.replace(
  /return res\.status\(404\)\.json\(\{\n        success: false,\n        message: 'No valid users found with phone numbers',\n      \}\);/g,
  `return error(res, 'No valid users found with phone numbers', 404);`
);

// 17. Replace bulk success
content = content.replace(
  /      res\.json\(\{\n        success: true,\n        message: 'Bulk WhatsApp sent successfully',\n        recipientsCount: users\.length,\n        recipients: phoneNumbers,\n      \}\);/g,
  `      return success(res, {
        message: 'Bulk WhatsApp sent successfully',
        recipients_count: users.length,
        recipients: phoneNumbers,
      });`
);

// 18. Replace bulk failure
content = content.replace(
  /    \} else \{\n      res\.status\(500\)\.json\(\{\n        success: false,\n        message: 'Failed to send bulk WhatsApp',\n        error: whatsappResult\.error,\n      \}\);\n    \}/g,
  `    return error(res, 'Failed to send bulk WhatsApp');`
);

// 19. Replace bulk catch
content = content.replace(
  /  \} catch \(error\) \{\n    console\.error\('\[WHATSAPP BULK SEND\] Error:', error\);\n    res\.status\(500\)\.json\(\{\n      success: false,\n      message: 'Error sending bulk WhatsApp',\n      error: error\.message,\n    \}\);\n  \}\n\}\);/g,
  `  } catch (err) {
    console.error('[WHATSAPP BULK SEND] Error:', err);
    return error(res, 'Error sending bulk WhatsApp');
  }
});`
);

// 20. Remove comments
content = content.replace("    // Get all users' phone numbers\n", '');
content = content.replace("    // Send bulk WhatsApp\n", '');
content = content.replace("      // Log the bulk WhatsApp sent\n", '');

fs.writeFileSync(file, content);
console.log('WhatsApp route part 2 updated');
