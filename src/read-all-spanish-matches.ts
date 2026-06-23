import fs from 'fs';

function run() {
  const content = fs.readFileSync('spanish_matches.txt', 'utf-8');
  console.log('Size of spanish_matches.txt:', content.length);
  
  // Search for any mention of options or a complete game/app structure
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (lower.includes('opcion') || lower.includes('option') || lower.includes('juego') || lower.includes('game') || lower.includes('b)') || lower.includes('b.')) {
      console.log(`Line ${idx + 1}: ${line.substring(0, 200)}`);
    }
  });
}

run();
