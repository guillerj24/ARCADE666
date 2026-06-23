import fs from 'fs';

function run() {
  const files = ['script_data_0.txt', 'script_data_1.txt'];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`\n=========================================`);
      console.log(`File: ${file} (Size: ${stats.size} bytes)`);
      console.log(`=========================================`);
      const content = fs.readFileSync(file, 'utf-8');
      console.log(content.substring(0, 1000));
      if (content.length > 1000) {
        console.log(`\n... [TRUNCATED, TOTAL LENGTH ${content.length}]`);
        console.log(`\nLAST 500 characters:`);
        console.log(content.substring(content.length - 500));
      }
    } else {
      console.log(`File ${file} does not exist.`);
    }
  });
}

run();
