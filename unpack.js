const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'EDUAI_PART1_of_1.txt');
const content = fs.readFileSync(filePath, 'utf-8');

const fileRegex = /================================================================================\r?\nFILE:\s*(.+?)\r?\n================================================================================\r?\n\r?\n([\s\S]*?)(?=\r?\n================================================================================\r?\nFILE:|$)/g;

let match;
let count = 0;
while ((match = fileRegex.exec(content)) !== null) {
  const relPath = match[1].trim();
  const fileContent = match[2];
  
  const absPath = path.join(__dirname, relPath);
  const dirPath = path.dirname(absPath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(absPath, fileContent.trim() + '\n', 'utf-8');
  console.log(`Updated: ${relPath}`);
  count++;
}

console.log(`\nSuccessfully updated ${count} files!`);
