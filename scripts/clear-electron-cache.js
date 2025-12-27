/**
 * Скрипт для очистки кэша electron-builder
 * Использование: node scripts/clear-electron-cache.js
 */
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const cacheDir = path.join(os.homedir(), '.cache', 'electron-builder');
const winCacheDir = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache');

console.log('🧹 Clearing electron-builder cache...');

try {
  if (process.platform === 'win32') {
    if (require('fs').existsSync(winCacheDir)) {
      console.log(`Removing: ${winCacheDir}`);
      execSync(`rmdir /s /q "${winCacheDir}"`, { stdio: 'inherit' });
    }
  } else {
    if (require('fs').existsSync(cacheDir)) {
      console.log(`Removing: ${cacheDir}`);
      execSync(`rm -rf "${cacheDir}"`, { stdio: 'inherit' });
    }
  }
  console.log('✅ Cache cleared successfully');
} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  process.exit(1);
}

