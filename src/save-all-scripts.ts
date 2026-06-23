import fs from 'fs';

function run() {
  const html = fs.readFileSync('temp_response.html', 'utf-8');
  console.log('Extracting all script tags from temp_response.html...');

  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  
  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1];
    const tag = match[0];
    
    // Get opening script tag attributes to see its type or ID
    const openTagEnd = tag.indexOf('>');
    const openTag = tag.substring(0, openTagEnd + 1);
    
    console.log(`Script ${count}: opening tag = ${openTag}, content size = ${content.length} characters`);
    fs.writeFileSync(`script_${count}.txt`, tag);
    count++;
  }
  
  console.log(`Saved ${count} scripts.`);
}

run();
