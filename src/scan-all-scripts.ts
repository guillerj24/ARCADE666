import fs from 'fs';

function run() {
  if (!fs.existsSync('temp_response.html')) {
    console.log('temp_response.html does not exist.');
    return;
  }
  const html = fs.readFileSync('temp_response.html', 'utf-8');
  console.log(`HTML size: ${html.length} chars`);

  // Find all <script> blocks
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  const scripts: string[] = [];
  
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    const content = match[1];
    scripts.push(content);
  }
  console.log(`Found ${scriptCount} script blocks.`);

  // Save them for analysis
  fs.writeFileSync('all_scripts.json', JSON.stringify(scripts, null, 2));
  console.log('Saved all scripts to all_scripts.json');

  // Let's analyze each script block to see which ones contain significant data or Spanish characters
  scripts.forEach((content, idx) => {
    const spanishCharRegex = /[áéíóúñ¡¿]/i;
    const hasSpanish = spanishCharRegex.test(content);
    const keywords = ['juego', 'canvas', 'clona', 'opción', 'opcion', 'option', 'Guillermo', 'Ramos', 'Chang'];
    const foundKeywords = keywords.filter(kw => content.toLowerCase().includes(kw.toLowerCase()));
    
    if (content.length > 500 || hasSpanish || foundKeywords.length > 0) {
      console.log(`Script ${idx + 1}: length = ${content.length}, hasSpanish = ${hasSpanish}, keywords = ${JSON.stringify(foundKeywords)}`);
      // Print first 200 chars and last 200 chars
      console.log(`  Start: ${content.substring(0, 200).replace(/\s+/g, ' ')}`);
      console.log(`  End  : ${content.substring(content.length - 200).replace(/\s+/g, ' ')}`);
    }
  });
}

run();
