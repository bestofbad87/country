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
  const responseBody = `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Information</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome Authenticated User!</h1>
          <p>${email} authenticated at ${timestamp} from ${countryLink}.</p>
        </div>
      </body>
    </html>
  `;

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
