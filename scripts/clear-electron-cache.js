/**
 * Скрипт для очистки кэша electron-builder
 * Использование: node scripts/clear-electron-cache.js
 */
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const cacheDir = path.join(os.homedir(), '.cache', 'electron-builder');
const winCacheDir = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache');

console.log('🧹 Clearing electron-builder cache...');

try {
  if (process.platform === 'win32') {
    if (fs.existsSync(winCacheDir)) {
      console.log(`Removing: ${winCacheDir}`);
      execSync(`rmdir /s /q "${winCacheDir}"`, { stdio: 'inherit' });
    }
  } else {
    if (fs.existsSync(cacheDir)) {
      console.log(`Removing: ${cacheDir}`);
      execSync(`rm -rf "${cacheDir}"`, { stdio: 'inherit' });
    }
  }
  console.log('✅ Cache cleared successfully');
} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  process.exit(1);
}

