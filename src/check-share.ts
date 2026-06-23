import fs from 'fs';

function run() {
  const html = fs.readFileSync('temp_response.html', 'utf-8');
  
  // Search for the share ID "3e054555fdc4"
  const shareId = '3e054555fdc4';
  const hasShareId = html.includes(shareId);
  console.log(`Contains "${shareId}": ${hasShareId}`);
  
  // Search for "share"
  let idx = 0;
  let count = 0;
  while ((idx = html.toLowerCase().indexOf('share', idx)) !== -1 && count < 10) {
    count++;
    console.log(`Found "share" at index ${idx}: ${html.substring(idx - 50, idx + 100)}`);
    idx += 5;
  }
}

run();
