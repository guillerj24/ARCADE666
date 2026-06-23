import fs from 'fs';

function run() {
  const fileContent = fs.readFileSync('temp_response.html', 'utf-8');
  console.log(`temp_response.html length: ${fileContent.length}`);
  
  // Search for occurrence of "Opcion" or "Opción" or "Option" (case insensitive)
  const regex = /opci[oó]n|option/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(fileContent)) !== null) {
    count++;
    const start = Math.max(0, match.index - 100);
    const end = Math.min(fileContent.length, match.index + 200);
    console.log(`\nMatch ${count} at index ${match.index}:`);
    console.log(fileContent.substring(start, end).replace(/\n/g, ' '));
  }
  
  console.log(`\nTotal matches: ${count}`);
}

run();
