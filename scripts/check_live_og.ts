async function checkLive() {
  try {
    const res = await fetch('https://www.isabelpepe.com', {
      headers: {
        'User-Agent': 'WhatsApp/2.21.12.21 A'
      }
    });
    console.log('Live Status:', res.status);
    const html = await res.text();
    const matches = html.match(/<meta[^>]+>/gi) || [];
    const ogTags = matches.filter(m => m.includes('og:') || m.includes('twitter:'));
    console.log('OG & Twitter Tags on live site:\n', ogTags.join('\n'));

    // Check if og-image.jpg is accessible
    const imgRes = await fetch('https://www.isabelpepe.com/og-image.jpg');
    console.log('\nhttps://www.isabelpepe.com/og-image.jpg status:', imgRes.status, imgRes.headers.get('content-type'), imgRes.headers.get('content-length'));
  } catch (e) {
    console.error('Error:', e);
  }
}
checkLive();
