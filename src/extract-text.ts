import fs from 'fs';

function run() {
  const html = fs.readFileSync('temp_response.html', 'utf-8');
  console.log(`HTML size: ${html.length} chars`);

  // Remove script and style tags completely
  let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Also remove HTML tags
  const textContent = cleanHtml.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n');
  
  console.log(`Clean text content length: ${textContent.length} chars`);
  fs.writeFileSync('clean_text.txt', textContent);
  
  // Let's print some blocks of text to see what is there
  const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log(`Total non-empty lines: ${lines.length}`);
  
  lines.slice(0, 100).forEach((line, i) => {
    console.log(`Line ${i + 1}: ${line}`);
  });
}

run();
