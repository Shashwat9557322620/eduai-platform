const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(require('os').homedir(), 'Downloads', 'EDUAI_SOURCE_CODE_FOR_REVIEW.txt');

const includeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.mjs'];
const excludeDirs = ['node_modules', '.next', '.git', 'coverage', 'dist', 'scripts'];
const excludeFiles = [
  'package-lock.json',
  'EDUAI_FULL_SOURCE_CODE.txt',
  'EDUAI_PART1_of_1.txt',
  'EDUAI_PORTFOLIO.md',
  'code-review.txt',
  'deepseek_prompt.txt',
  'dev.log',
  'dev-error.log',
  'export_code.js',
];

function getAllFiles(dir) {
  let results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (!excludeDirs.includes(item.name)) {
          results = results.concat(getAllFiles(fullPath));
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        const baseName = path.basename(item.name);
        if (includeExtensions.includes(ext) && !excludeFiles.includes(baseName)) {
          results.push(fullPath);
        }
      }
    }
  } catch (e) {}
  return results;
}

const files = getAllFiles(projectRoot);
files.sort();

let output = '';
output += '================================================================\n';
output += '  EDUAI - COMPLETE SOURCE CODE FOR AI CODE REVIEW\n';
output += '  Generated: ' + new Date().toISOString() + '\n';
output += '  Total Files: ' + files.length + '\n';
output += '================================================================\n\n';
output += 'PROJECT: EduAI - AI-Powered Education Platform\n';
output += 'STACK: Next.js 16, React 19, TypeScript, Tailwind CSS v4\n';
output += 'AUTH: Clerk | DB: Supabase | AI: Google Gemini | Payments: Razorpay\n';
output += 'DEPLOYMENT: Vercel\n\n';

output += '================================================================\n';
output += '  ARCHITECTURE OVERVIEW\n';
output += '================================================================\n\n';
output += 'FOLDER STRUCTURE:\n';
output += '  app/                 - Next.js App Router pages & layouts\n';
output += '    api/               - API routes (serverless functions)\n';
output += '    components/        - Shared React components\n';
output += '    hooks/             - Custom React hooks\n';
output += '    admin/             - Admin dashboard\n';
output += '    blog/              - Blog with dynamic slugs\n';
output += '  lib/                 - Shared utilities & services\n';
output += '  tests/               - Unit & E2E tests\n';
output += '  public/              - Static assets, PWA manifest, SW\n';
output += '  scripts/             - Migration & utility scripts\n\n';
output += 'KEY FEATURES:\n';
output += '  1. Curriculum Optimizer - AI study plan generator\n';
output += '  2. Neural Flashcards - AI flashcard generator with 3D flip\n';
output += '  3. Skill Gap Analyzer - Career skill assessment\n';
output += '  4. AI Tutor - Chat-based learning assistant\n';
output += '  5. Study Groups - Collaborative learning with chat/notes\n';
output += '  6. Podcast Generator - Study material to audio scripts\n';
output += '  7. Admin Dashboard - User mgmt, refunds, tickets, analytics\n';
output += '  8. Billing - Razorpay payment integration\n';
output += '  9. Support System - Ticket submission & tracking\n';
output += ' 10. PWA - Service worker, install prompt, offline support\n\n';

output += '================================================================\n';
output += '  TABLE OF CONTENTS\n';
output += '================================================================\n\n';
files.forEach((f, i) => {
  const size = fs.statSync(f).size;
  const relPath = path.relative(projectRoot, f).replace(/\\/g, '/');
  output += String(i + 1).padStart(3) + '. ' + relPath.padEnd(70) + (size / 1024).toFixed(1) + ' KB\n';
});
output += '\n================================================================\n';
output += '  BEGIN SOURCE CODE\n';
output += '================================================================\n\n';

files.forEach((f) => {
  try {
    const content = fs.readFileSync(f, 'utf-8');
    const relPath = path.relative(projectRoot, f).replace(/\\/g, '/');
    output += '================================================================\n';
    output += 'FILE: ' + relPath + '\n';
    output += 'SIZE: ' + content.length + ' chars | ' + (content.split('\n').length) + ' lines\n';
    output += '================================================================\n';
    output += content + '\n\n';
  } catch (e) {
    // skip files that can't be read
  }
});

output += '================================================================\n';
output += '  END OF SOURCE CODE\n';
output += '================================================================\n';
output += '  This file was auto-generated for AI code review.\n';
output += '  Paste this into any AI tool for comprehensive review.\n';
output += '================================================================\n';

fs.writeFileSync(outputFile, output, 'utf-8');
console.log('Done! File written to: ' + outputFile);
console.log('Total source files: ' + files.length);
console.log('Total output size: ' + (fs.statSync(outputFile).size / 1024).toFixed(1) + ' KB');
console.log('Total output lines: ' + output.split('\n').length);
