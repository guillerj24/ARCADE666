import fs from 'fs';

function run() {
  if (!fs.existsSync('extracted_strings.txt')) {
    console.log('extracted_strings.txt does not exist.');
    return;
  }
  const content = fs.readFileSync('extracted_strings.txt', 'utf-8');
  console.log(`extracted_strings.txt size: ${content.length} chars`);
  
  const keywords = ['juego', 'pantalla', 'clona', 'código', 'aplicación', 'jugar', 'puntuación', 'nivel', 'tarjeta', 'opción', 'opcion', 'option', 'canvas', 'game', 'score', 'ahorcado', 'tic-tac-toe', 'memoria', 'flappy', 'snake', 'tetris', 'trivia', 'ahorcado', 'blackjack'];
  keywords.forEach(kw => {
    const regex = new RegExp(kw, 'gi');
    const matches = content.match(regex);
    console.log(`- "${kw}": ${matches ? matches.length : 0} matches`);
    if (matches && matches.length > 0) {
      let idx = content.toLowerCase().indexOf(kw.toLowerCase());
      console.log(`    Sample: ${content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 150)).replace(/\n/g, ' ')}`);
    }
  });
}

run();
