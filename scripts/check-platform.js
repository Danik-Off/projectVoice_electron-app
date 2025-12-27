/**
 * Проверка платформы перед сборкой
 * Использование: node scripts/check-platform.js [win|mac|linux]
 */
import os from 'os';
const platform = process.argv[2];

if (!platform) {
  console.error('Usage: node scripts/check-platform.js [win|mac|linux]');
  process.exit(1);
}

const currentPlatform = os.platform();
const platformMap = {
  win: 'win32',
  mac: 'darwin',
  linux: 'linux'
};

const targetPlatform = platformMap[platform];

if (!targetPlatform) {
  console.error(`Invalid platform: ${platform}. Use: win, mac, or linux`);
  process.exit(1);
}

if (targetPlatform !== currentPlatform && platform === 'linux') {
  console.error('❌ Error: Linux AppImage can only be built on Linux systems.');
  console.error('   Use one of the following options:');
  console.error('   1. Build in CI/CD (GitHub Actions)');
  console.error('   2. Use Docker with Linux image');
  console.error('   3. Use WSL (Windows Subsystem for Linux)');
  console.error('   4. Build on a Linux machine');
  process.exit(1);
}

if (targetPlatform !== currentPlatform && platform === 'mac') {
  console.error('❌ Error: macOS builds can only be built on macOS systems.');
  console.error('   Use one of the following options:');
  console.error('   1. Build on a macOS machine');
  console.error('   2. Use CI/CD with macOS runner');
  process.exit(1);
}

console.log(`✅ Platform check passed: building for ${platform} on ${currentPlatform}`);

