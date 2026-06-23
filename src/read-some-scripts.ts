import fs from 'fs';

function run() {
  const content = fs.readFileSync('all_scripts.json', 'utf-8');
  const scripts = JSON.parse(content);
  const script1 = scripts[0];
  
  // Script 1 is 'window.WIZ_global_data = { ... };'
  const prefix = 'window.WIZ_global_data = ';
  const startIdx = script1.indexOf(prefix);
  if (startIdx === -1) {
    console.log('Prefix not found');
    return;
  }
  
  let jsonStr = script1.substring(startIdx + prefix.length).trim();
  if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1);
  }
  
  try {
    const data = JSON.parse(jsonStr);
    console.log('Keys of WIZ_global_data:', Object.keys(data));
    
    // Let's print each key and a preview of its value
    Object.keys(data).forEach(key => {
      const val = data[key];
      const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
      console.log(`- Key "${key}": type = ${typeof val}, length = ${valStr.length}, preview = ${valStr.substring(0, 200)}`);
    });
  } catch (err) {
    console.error('JSON parse error in script 1:', err);
  }
}

run();
