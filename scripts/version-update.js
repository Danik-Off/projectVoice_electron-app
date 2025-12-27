/**
 * Скрипт для обновления версии в package.json
 * Использование: node scripts/version-update.js [patch|minor|major]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const type = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version.split('.').map(Number);

switch (type) {
  case 'patch':
    version[2]++;
    break;
  case 'minor':
    version[1]++;
    version[2] = 0;
    break;
  case 'major':
    version[0]++;
    version[1] = 0;
    version[2] = 0;
    break;
}

packageJson.version = version.join('.');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

console.log(`✅ Version updated to ${packageJson.version}`);

