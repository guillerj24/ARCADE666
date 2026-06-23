async function run() {
  const targetUrl = 'https://gemini.google.com/share/3e054555fdc4';
  const proxyUrls = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];

  for (const proxyUrl of proxyUrls) {
    console.log(`\nFetching via proxy: ${proxyUrl}...`);
    try {
      const res = await fetch(proxyUrl);
      console.log(`Status: ${res.status}`);
      if (res.status === 200) {
        let text = await res.text();
        console.log(`Response length: ${text.length}`);
        
        // If it's allorigins, it returns a JSON with { contents: "..." }
        if (proxyUrl.includes('allorigins')) {
          try {
            const parsed = JSON.parse(text);
            text = parsed.contents;
            console.log(`Extracted contents length from allorigins: ${text.length}`);
          } catch (e) {
            console.log('Failed to parse allorigins JSON');
          }
        }
        
        // Search for keywords in the proxy response
        const keywords = ['3e054555fdc4', 'clona', 'useState', 'canvas', 'juego'];
        keywords.forEach(kw => {
          const count = (text.match(new RegExp(kw, 'gi')) || []).length;
          console.log(`  - Keyword "${kw}": ${count} occurrences`);
        });

        // Let's write the response if it looks valid
        if (text.includes('3e054555fdc4') && text.length > 50000) {
          const occurrencesOfShareId = (text.match(/3e054555fdc4/gi) || []).length;
          if (occurrencesOfShareId > 2) {
            console.log('FOUND REAL SHARE DATA!');
            fs.writeFileSync('proxy_response.html', text);
            return;
          }
        }
      }
    } catch (err) {
      console.error(`Error with proxy ${proxyUrl}:`, err);
    }
  }
}

// We need to import fs for file writing
import fs from 'fs';
run();
