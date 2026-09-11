const fs = require('fs');
const file = 'backend/routes/sms.js';
let content = fs.readFileSync(file, 'utf8');

// Replace res.status(400).json({ success: false, ... }) with error(res, ...)
// Replace res.json({ success: true, ... }) with success(res, ...)
// Replace res.status(500).json({ success: false, ... }) with error(res, ...)

// 1. Remove the manual validation check (line 48-53) since Zod handles it
content = content.replace(
  /    if \(!userId \|\| !message\) \{\n      return res\.status\(400\)\.json\(\{\n        success: false,\n        message: 'User ID and message are required',\n      \}\);\n    \}\n\n    \/\/ Get user's phone number from database/g,
  '',
);

// 2. Replace user not found response
content = content.replace(
  /return res\.status\(404\)\.json\(\{\n        success: false,\n        message: 'User not found',\n      \}\);/g,
  "return error(res, 'User not found', 404);",
);

// 3. Replace phone number missing response
content = content.replace(
  /return res\.status\(400\)\.json\(\{\n        success: false,\n        message: 'You do not have a phone number registered\. Please update your profile\.',\n      \}\);/g,
  "return error(res, 'You do not have a phone number registered. Please update your profile.');",
);

// 4. Replace success response for SMS send
content = content.replace(
  /      const simulated = Boolean\(smsResult\?\.data\?\.simulated\);\n      res\.json\(\{\n        success: true,\n        message: simulated\n          \? 'Message queued for delivery to company'\n          : 'Message sent successfully to company',\n        from: user\.phone_number,\n        to: COMPANY_PHONE_NUMBER,\n        simulated,\n        relay_id: smsResult\?\.data\?\.relay_id \|\| smsResult\?\.data\?\.message_id,\n      \}\);/g,
  `      const simulated = Boolean(smsResult?.data?.simulated);
      return success(res, {
        message: simulated ? 'Message queued for delivery to company' : 'Message sent successfully to company',
        from: user.phone_number,
        to: COMPANY_PHONE_NUMBER,
        simulated,
        relay_id: smsResult?.data?.relay_id || smsResult?.data?.message_id,
      });`,
);

// 5. Replace failure response for SMS send
content = content.replace(
  /    \} else \{\n      res\.status\(500\)\.json\(\{\n        success: false,\n        message: 'Failed to send SMS',\n        error: smsResult\.error,\n      \}\);\n    \}/g,
  "    return error(res, 'Failed to send SMS');",
);

// 6. Replace catch block
content = content.replace(
  /  \} catch \(error\) \{\n    console\.error\('\[SMS SEND\] Error:', error\);\n    res\.status\(500\)\.json\(\{\n      success: false,\n      message: 'Error sending SMS',\n      error: error\.message,\n    \}\);\n  \}/g,
  `  } catch (err) {
    console.error('[SMS SEND] Error:', err);
    return error(res, 'Error sending SMS');
  }`,
);

// 7. Remove comment
content = content.replace('    // Send SMS FROM user TO company number\n', '');

// 8. Replace activity log comment
content = content.replace(
  '        // Log the SMS sent\n        await db.promise().query(',
  '        await db.promise().query(',
);

// 9. Replace catch for log error
content = content.replace(
  /      \} catch \(logError\) \{\n        console\.warn\(\n          '\[SMS SEND\] Activity log insert failed, continuing with relay success:',\n          logError\.message,\n        \);\n      \}/g,
  `      } catch (logError) {
        console.warn('[SMS SEND] Activity log insert failed:', logError.message);
      }`,
);

fs.writeFileSync(file, content);
console.log('SMS route updated successfully');
