addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  // Extract user information from Cloudflare request headers
  const email = request.headers.get('cf-access-authenticated-user-email');
  const timestamp = new Date().toISOString();
  const country = request.headers.get('cf-ipcountry');
  const countryLink = `<a href="/secure/${country.toLowerCase()}">${country}</a>`;
  const responseBody = `${email} authenticated at ${timestamp} from ${countryLink}.`;

  // This is the /secure path
  if (pathSegments.length === 1 && pathSegments[0] === 'secure') {
    return new Response(responseBody, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // This is the /secure/${country} path
  if (pathSegments.length === 2 && pathSegments[0] === 'secure') {
    const countryParam = pathSegments[1];
    try {
      // Fetch the country flag from the private R2 bucket
      const flagBuffer = await country_buckets.get(`${countryParam}.png`, 'arrayBuffer');
      const flagResponse = new Response(flagBuffer, {
        headers: {
          'Content-Type': 'image/png',
        },
      });
      return flagResponse;
    } catch (error) {
      // Handle errors (e.g., country flag not found)
      return new Response('Country flag not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  // Return a simple response for other paths
  return new Response(responseBody, {
    headers: { 'Content-Type': 'text/html' },
  });
}
