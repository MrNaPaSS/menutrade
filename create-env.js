const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const content = 'VITE_OPENROUTER_API_KEY=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\n';

fs.writeFileSync(envPath, content, 'utf8');
console.log('✅ Файл .env создан в корне проекта:');
console.log(envPath);
console.log('\nСодержимое:');
console.log(content);

