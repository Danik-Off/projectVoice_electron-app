/**
 * Скрипт для обновления version.json при сборке
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionJsonPath = path.join(__dirname, '..', 'src', 'version.json');

// Читаем версию из package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Получаем git hash
let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (error) {
  console.warn('Could not get git hash:', error.message);
}

// Получаем текущую дату
const now = new Date();
const buildDate = now.toISOString().split('T')[0].replace(/-/g, '.');
const buildTimestamp = now.toISOString();

// Создаем объект версии
const versionData = {
  version,
  gitHash,
  buildDate,
  buildTimestamp
};

// Записываем в version.json
fs.writeFileSync(
  versionJsonPath,
  JSON.stringify(versionData, null, 2) + '\n',
  'utf8'
);

console.log('✅ Version updated:', versionData);

