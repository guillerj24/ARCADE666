import fs from 'fs';

async function run() {
  const targetUrl = 'https://gemini.google.com/share/3e054555fdc4';
  const jinaUrl = `https://r.jina.ai/${targetUrl}`;
  
  console.log(`Fetching via Jina Reader: ${jinaUrl}...`);
  try {
    const res = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
      }
    });
    console.log(`Status: ${res.status}`);
    if (res.status === 200) {
      const text = await res.text();
      console.log(`Response size: ${text.length} characters`);
      
      fs.writeFileSync('jina_markdown.md', text);
      console.log('Saved response to jina_markdown.md');

      // Let's print the first 1000 characters of the markdown
      console.log('\n=========================================');
      console.log('Jina Markdown Output (First 1500 chars):');
      console.log('=========================================');
      console.log(text.substring(0, 1500));
      
    } else {
      console.log(`Failed to fetch: ${res.status} ${res.statusText}`);
      const body = await res.text();
      console.log(`Response body: ${body.substring(0, 500)}`);
    }
  } catch (err) {
    console.error('Error fetching via Jina Reader:', err);
  }
}

run();
