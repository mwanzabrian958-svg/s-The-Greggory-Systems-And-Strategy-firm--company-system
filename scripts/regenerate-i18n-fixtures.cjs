// Regenerates __tests__/i18n-fixtures.cjs from the live locale JSON files.
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const outPath = path.join(__dirname, '__tests__', 'i18n-fixtures.cjs');

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const sw = JSON.parse(fs.readFileSync(path.join(localesDir, 'sw.json'), 'utf8'));
const fr = JSON.parse(fs.readFileSync(path.join(localesDir, 'fr.json'), 'utf8'));

const body = `module.exports = {\n  en: ${JSON.stringify(en)},\n  sw: ${JSON.stringify(sw)},\n  fr: ${JSON.stringify(fr)}\n};\n`;
fs.writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${outPath} (en=${Object.keys(en).length}, sw=${Object.keys(sw).length}, fr=${Object.keys(fr).length})`);