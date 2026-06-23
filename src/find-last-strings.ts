import fs from 'fs';

function run() {
  const content = fs.readFileSync('extracted_strings.txt', 'utf-8');
  const strings = content.split('\n\n---\n\n');
  console.log(`Loaded ${strings.length} strings.`);

  // Let's filter for strings containing Spanish characters or words
  // e.g. "á", "é", "í", "ó", "ú", "ñ", "¡", "¿", "juego", "clona", "mejora", "Guillermo", "Ramos", "Chang"
  const isSpanish = (s: string) => {
    return (
      /[áéíóúñ¡¿]/.test(s) ||
      /\b(el|la|los|las|un|una|unos|unas|y|o|pero|para|por|con|como|en|su|sus|este|esta|todo|todos|todo|bien|mal|hacer|ver|juego|jugar|puntos|puntuación|nivel|clona|mejora|pantalla|código)\b/i.test(s)
    );
  };

  const filtered = strings.map((s, idx) => ({ s, idx })).filter(item => isSpanish(item.s));
  console.log(`Found ${filtered.length} matches.`);

  // Write matches to a file to inspect
  const output = filtered.map(item => `INDEX: ${item.idx}\nLENGTH: ${item.s.length}\nCONTENT:\n${item.s}`).join('\n\n============================================\n\n');
  fs.writeFileSync('spanish_matches.txt', output);
  console.log('Saved matches to spanish_matches.txt');

  // Print summary of indices of first and last 20 matches
  console.log('First 10 indices:', filtered.slice(0, 10).map(i => i.idx));
  console.log('Last 10 indices:', filtered.slice(-10).map(i => i.idx));
}

run();
