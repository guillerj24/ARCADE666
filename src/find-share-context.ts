import fs from 'fs';
import path from 'path';

function run() {
  const files = fs.readdirSync('.').filter(f => f.endsWith('.txt') || f.endsWith('.html') || f.endsWith('.md'));
  console.log(`Scanning ${files.length} files in root...`);
  
  const keywords = ['clona', 'mejora', 'juego', 'canvas', 'opción', 'opcion', 'option b', 'opción b', 'game', 'score', 'Guillermo', 'Ramos', 'Chang'];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = keywords.filter(kw => content.toLowerCase().includes(kw.toLowerCase()));
    if (matches.length > 0) {
      console.log(`File "${file}" (size ${content.length}): matches ${JSON.stringify(matches)}`);
      // Print context of match
      matches.forEach(kw => {
        let idx = content.toLowerCase().indexOf(kw.toLowerCase());
        console.log(`  - "${kw}" context: ${content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 150)).replace(/\s+/g, ' ')}`);
      });
    }
  });
}

run();
