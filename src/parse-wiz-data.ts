import fs from 'fs';

function run() {
  const content = fs.readFileSync('script_data_0.txt', 'utf-8');
  
  // Extract JSON string from `<script ...>window.WIZ_global_data = { ... };</script>`
  const startMarker = 'window.WIZ_global_data = ';
  const endMarker = '};</script>';
  
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.lastIndexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    console.log('Could not find WIZ_global_data JSON bounds');
    return;
  }
  
  const jsonStr = content.substring(startIdx + startMarker.length, endIdx + 1);
  console.log(`JSON string length: ${jsonStr.length}`);
  
  try {
    const data = JSON.parse(jsonStr);
    const keys = Object.keys(data);
    console.log(`Parsed WIZ_global_data successfully. Keys (${keys.length}):`);
    
    keys.forEach(key => {
      const val = data[key];
      const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
      console.log(`- Key: "${key}" (Type: ${typeof val}, Length/Value: ${valStr.substring(0, 150)}${valStr.length > 150 ? '...' : ''})`);
    });
    
    // Let's search inside the whole WIZ_global_data for anything related to games, apps, or HTML
    const dataStr = JSON.stringify(data);
    const keywords = ['canvas', 'game', 'score', 'react', 'button', 'import', 'juego', 'html', 'javascript', 'typescript', 'style', 'head', 'body'];
    console.log('\nScanning WIZ_global_data for development keywords:');
    keywords.forEach(kw => {
      const count = (dataStr.match(new RegExp(kw, 'gi')) || []).length;
      console.log(`- Keyword "${kw}": ${count} occurrences`);
    });
    
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
}

run();
