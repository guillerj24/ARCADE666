import fs from 'fs';

function run() {
  const content = fs.readFileSync('script_0.txt', 'utf-8');
  console.log('Searching script_0.txt for text and markdown structures...');

  // We want to find long strings or blocks of text that might contain code or conversations.
  // We can look for patterns like markdown headers (e.g., "###", "##", "**") or code blocks ("```").
  
  const keywords = ['```', '###', '##', '**', 'import React', 'const ', 'function ', 'juego', 'canvas', 'Guillermo', 'clona', 'mejora'];
  keywords.forEach(kw => {
    const idxs: number[] = [];
    let pos = content.indexOf(kw);
    while (pos !== -1) {
      idxs.push(pos);
      pos = content.indexOf(kw, pos + 1);
    }
    console.log(`Keyword "${kw}": found ${idxs.length} times`);
    if (idxs.length > 0) {
      idxs.slice(0, 5).forEach((idx, i) => {
        const start = Math.max(0, idx - 150);
        const end = Math.min(content.length, idx + 250);
        console.log(`  Occur ${i + 1} (index ${idx}):`);
        console.log(`  Context: "... ${content.substring(start, end).replace(/\n/g, ' ')} ..."`);
      });
    }
  });
}

run();
