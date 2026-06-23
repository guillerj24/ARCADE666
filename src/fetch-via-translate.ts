import fs from 'fs';

async function run() {
  const targetUrl = 'https://gemini.google.com/share/3e054555fdc4';
  const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(targetUrl)}`;
  
  console.log(`Fetching via Google Translate proxy: ${translateUrl}...`);
  try {
    const res = await fetch(translateUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    console.log(`Status: ${res.status}`);
    if (res.status === 200) {
      const text = await res.text();
      console.log(`Response size: ${text.length} characters`);
      
      // Let's check for keywords in the translation response
      const keywords = ['3e054555fdc4', 'clona', 'useState', 'canvas', 'juego', 'game', 'score'];
      keywords.forEach(kw => {
        const count = (text.match(new RegExp(kw, 'gi')) || []).length;
        console.log(`  - Keyword "${kw}": ${count} occurrences`);
      });

      fs.writeFileSync('translate_response.html', text);
      console.log('Saved response to translate_response.html');
    } else {
      console.log(`Failed to fetch: ${res.statusText}`);
    }
  } catch (err) {
    console.error('Error fetching via translate:', err);
  }
}

run();
