import fs from 'fs';

function summarize(filename: string) {
  if (!fs.existsSync(filename)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.split('\n');
  console.log(`\n=========================================`);
  console.log(`File: ${filename} (Total lines: ${lines.length}, Size: ${content.length} chars)`);
  console.log(`=========================================`);
  
  let nonBlankCount = 0;
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      nonBlankCount++;
      if (nonBlankCount <= 30) {
        console.log(`Line ${idx + 1}: [Length ${line.length}] ${trimmed.substring(0, 300)}${trimmed.length > 300 ? '...' : ''}`);
      }
    }
  });
  console.log(`Total non-blank lines: ${nonBlankCount}`);
}

summarize('spanish_matches.txt');
summarize('spanish_strings.txt');
summarize('extracted_code.txt');
