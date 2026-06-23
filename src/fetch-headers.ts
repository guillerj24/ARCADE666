async function run() {
  const url = 'https://gemini.google.com/share/3e054555fdc4';
  console.log(`Fetching ${url} and printing headers...`);

  try {
    const res = await fetch(url, {
      redirect: 'manual', // Don't auto-follow redirects so we can see what's happening
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    console.log(`Status: ${res.status}`);
    console.log(`Status Text: ${res.statusText}`);
    console.log('\nResponse Headers:');
    res.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
