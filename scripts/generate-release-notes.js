/**
 * Генерация описания релиза на основе коммитов
 */
const { execSync } = require('child_process');

function getVersion() {
  try {
    const packageJson = require('../package.json');
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read package.json:', error);
    return 'unknown';
  }
}

function getCommitsSinceLastTag() {
  try {
    // Получаем последний тег
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
    
    if (!lastTag) {
      // Если тегов нет, берем все коммиты
      return execSync('git log --pretty=format:"%s"', { encoding: 'utf8' }).trim().split('\n').slice(0, 20);
    }
    
    // Получаем коммиты с последнего тега
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, { encoding: 'utf8' }).trim();
    return commits ? commits.split('\n') : [];
  } catch (error) {
    console.warn('Failed to get commits:', error.message);
    return [];
  }
}

function categorizeCommits(commits) {
  const categories = {
    feat: [],
    fix: [],
    chore: [],
    docs: [],
    refactor: [],
    style: [],
    test: [],
    other: []
  };

  commits.forEach(commit => {
    const lowerCommit = commit.toLowerCase();
    if (lowerCommit.startsWith('feat:') || lowerCommit.startsWith('feature:')) {
      categories.feat.push(commit);
    } else if (lowerCommit.startsWith('fix:') || lowerCommit.startsWith('bugfix:')) {
      categories.fix.push(commit);
    } else if (lowerCommit.startsWith('chore:')) {
      categories.chore.push(commit);
    } else if (lowerCommit.startsWith('docs:') || lowerCommit.startsWith('doc:')) {
      categories.docs.push(commit);
    } else if (lowerCommit.startsWith('refactor:')) {
      categories.refactor.push(commit);
    } else if (lowerCommit.startsWith('style:')) {
      categories.style.push(commit);
    } else if (lowerCommit.startsWith('test:')) {
      categories.test.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

function generateReleaseNotes() {
  const version = getVersion();
  const commits = getCommitsSinceLastTag();
  const categories = categorizeCommits(commits);

  let notes = `# 🚀 Release v${version}\n\n`;
  
  notes += `## 📦 Downloads\n\n`;
  notes += `### Windows\n`;
  notes += `- **Installer**: Download the \`.exe\` installer for Windows\n`;
  notes += `- **Portable**: Download the portable version (no installation required)\n\n`;
  notes += `### Linux\n`;
  notes += `- **AppImage**: Download the \`.AppImage\` file (runs on most Linux distributions)\n`;
  notes += `- Make executable: \`chmod +x ProjectVoice-*.AppImage\`\n\n`;

  if (commits.length > 0) {
    notes += `## 📝 Changes\n\n`;

    if (categories.feat.length > 0) {
      notes += `### ✨ New Features\n`;
      categories.feat.forEach(commit => {
        const message = commit.replace(/^(feat|feature):\s*/i, '');
        notes += `- ${message}\n`;
      });
      notes += `\n`;
    }

    if (categories.fix.length > 0) {
      notes += `### 🐛 Bug Fixes\n`;
      categories.fix.forEach(commit => {
        const message = commit.replace(/^(fix|bugfix):\s*/i, '');
        notes += `- ${message}\n`;
      });
      notes += `\n`;
    }

    if (categories.refactor.length > 0) {
      notes += `### ♻️ Refactoring\n`;
      categories.refactor.forEach(commit => {
        const message = commit.replace(/^refactor:\s*/i, '');
        notes += `- ${message}\n`;
      });
      notes += `\n`;
    }

    if (categories.docs.length > 0) {
      notes += `### 📚 Documentation\n`;
      categories.docs.forEach(commit => {
        const message = commit.replace(/^(docs|doc):\s*/i, '');
        notes += `- ${message}\n`;
      });
      notes += `\n`;
    }

    if (categories.chore.length > 0 && categories.chore.length < 10) {
      notes += `### 🔧 Maintenance\n`;
      categories.chore.forEach(commit => {
        const message = commit.replace(/^chore:\s*/i, '');
        notes += `- ${message}\n`;
      });
      notes += `\n`;
    }

    if (categories.other.length > 0) {
      notes += `### 📌 Other Changes\n`;
      categories.other.forEach(commit => {
        notes += `- ${commit}\n`;
      });
      notes += `\n`;
    }
  } else {
    notes += `## 📝 Changes\n\n`;
    notes += `- Automated release build\n\n`;
  }

  notes += `## 🔧 Installation Instructions\n\n`;
  notes += `### Windows\n`;
  notes += `1. Download the \`.exe\` installer\n`;
  notes += `2. Run the installer and follow the setup wizard\n`;
  notes += `3. Launch ProjectVoice from the Start menu\n\n`;
  notes += `### Linux\n`;
  notes += `1. Download the \`.AppImage\` file\n`;
  notes += `2. Make it executable: \`chmod +x ProjectVoice-*.AppImage\`\n`;
  notes += `3. Run: \`./ProjectVoice-*.AppImage\`\n\n`;

  notes += `---\n\n`;
  notes += `**Full Changelog**: https://github.com/${process.env.GITHUB_REPOSITORY || 'your-username/your-repo'}/compare/v${getPreviousVersion()}...v${version}\n`;

  return notes;
}

function getPreviousVersion() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
    if (lastTag) {
      return lastTag.replace(/^v/, '');
    }
    return '0.0.0';
  } catch {
    return '0.0.0';
  }
}

if (require.main === module) {
  console.log(generateReleaseNotes());
}

module.exports = { generateReleaseNotes, getVersion };

