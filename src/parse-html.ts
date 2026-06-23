import fs from 'fs';

function run() {
  const html = fs.readFileSync('temp_response.html', 'utf-8');
  console.log('Searching HTML for code blocks or data structures...');

  // Search for AF_initDataCallback or other data arrays
  const regex = /AF_initDataCallback\([^)]+\)/g;
  const callbacks = html.match(regex);
  if (callbacks) {
    console.log(`Found ${callbacks.length} AF_initDataCallback calls.`);
    for (let i = 0; i < callbacks.length; i++) {
      fs.writeFileSync(`callback_${i}.txt`, callbacks[i]);
    }
  }

  // Also check if there's code/pre blocks in the HTML
  const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  const preBlocks: string[] = [];
  let match;
  while ((match = preRegex.exec(html)) !== null) {
    preBlocks.push(match[1]);
  }
  console.log(`Found ${preBlocks.length} pre blocks.`);
  if (preBlocks.length > 0) {
    fs.writeFileSync('pre_blocks.txt', preBlocks.join('\n---\n'));
    console.log('Saved pre blocks to pre_blocks.txt');
  }

  // Look for script tags that contain "c:" or data
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log(`Found ${scripts.length} script tags.`);
  let dataScriptsCount = 0;
  scripts.forEach((s, idx) => {
    if (s.includes('ds:') || s.includes('W_system') || s.includes('INITIAL_DATA') || s.includes('share')) {
      fs.writeFileSync(`script_data_${dataScriptsCount++}.txt`, s);
    }
  });
  console.log(`Saved ${dataScriptsCount} data scripts.`);
}

run();
