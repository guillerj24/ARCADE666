import fs from 'fs';

async function run() {
  const targetUrl = 'https://gemini.google.com/share/3e054555fdc4';
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  
  console.log(`Fetching via corsproxy.io: ${proxyUrl}...`);
  try {
    const res = await fetch(proxyUrl);
    console.log(`Status: ${res.status}`);
    if (res.status === 200) {
      const text = await res.text();
      console.log(`Response size: ${text.length} characters`);
      
      // Let's check for keywords in the proxy response
      const keywords = ['3e054555fdc4', 'clona', 'useState', 'canvas', 'juego', 'game', 'score'];
      keywords.forEach(kw => {
        const count = (text.match(new RegExp(kw, 'gi')) || []).length;
        console.log(`  - Keyword "${kw}": ${count} occurrences`);
      });

      fs.writeFileSync('corsproxy_response.html', text);
      console.log('Saved response to corsproxy_response.html');

      // Let's inspect some content near any interesting keywords if found
      if (text.includes('3e054555fdc4')) {
        console.log('Word "3e054555fdc4" is present!');
      }
    } else {
      console.log(`Failed to fetch: ${res.statusText}`);
    }
  } catch (err) {
    console.error('Error fetching via corsproxy:', err);
  }
}

run();
