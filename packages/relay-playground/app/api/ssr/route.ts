import {cookies} from 'next/headers';
import {search} from './search';
import config from '../../../next.config';

const COOKIE_NAME = 'coveo_visitorId';
export const dynamic = 'force-static';

interface Product {
  ec_name: string;
  ec_description: string;
  ec_price: number;
  ec_thumbnails: string[];
}

const setupInstructions = `
  <h2>Setup</h2>
  <p>To demonstrate how server-side rendering (SSR) works, follow these steps:</p>
  <ol>
    <li>
      Clone <a href="https://github.com/coveo-platform/relay" target="_blank" rel="noopener noreferrer">https://github.com/coveo-platform/relay</a>
    </li>
    <li>Follow the README steps to run the playground locally.</li>
    <li>
      Remove <code>output: "export"</code> from <code>module.exports</code> in
      <code>relay/apps/playground/next.config.js</code>.
    </li>
    <li> Remove <code>export const dynamic = 'force-static'</code> from <code>relay/apps/playground/app/api/ssr/route.ts</code>.</li>
  </ol>
`;

const nav = `
  <header>
    <nav>
      <h1>
        <a href="/" style="text-decoration: none; color: blue;">Relay Playground</a>
      </h1>
    </nav>
  </header>
`;

const generateHtmlResponse = (
  cookieValue: string,
  cookieStatus: string,
  products: Product[]
): string => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SSR</title>
      <script>
        function deleteCookie() {
          document.cookie = '${COOKIE_NAME}=; Max-Age=0; path=/;';
          document.getElementById('cookieValue').innerText = 'No cookie set.';
          alert('Cookie deleted.');
        }
      </script>
    </head>
    <body>
      ${nav}
      ${setupInstructions}
      <h2>Cookie Management Explanation</h2>
      <p>This page demonstrates how to manage the client ID during server-side rendering (SSR).</p>
      <p>When performing SSR, the first request to Coveo is made from the server. The Commerce API requires these requests to include a client ID so that the response is personalized based on the visitor's previous behavior.</p>
      <p>There are two scenarios: 
        <br /> 1. <strong>New Visitor</strong>: The server generates a unique client ID for you.
        <br /> 2. <strong>Returning Visitor</strong>: The server retrieves your client ID from cookies.
      </p>
      <p>This page makes a search request to the Commerce API, ensuring both scenarios are covered. It indicates whether the client ID was generated or retrieved from cookies.</p>
      <p>Additionally, there is a button to remove the client ID from the browser, allowing it to be generated again by the server. Reload the page to see how both scenarios are handled.</p>
      <h2>Current Status</h2>
      <p>The client ID was <strong>${cookieStatus}</strong>. Its value is: <strong id="cookieValue">${cookieValue}</strong></p>
      <button onclick="deleteCookie()">Delete Cookie</button>
      <h2>Product List</h2>
      ${
        products.length > 0
          ? `
        <ul>
          ${products
            .map(
              (product) => `
            <li>
              <h3>${product.ec_name}</h3>
              <p>${product.ec_description}</p>
              <p><strong>Price:</strong> ${product.ec_price}</p>
              <img src="${product.ec_thumbnails[0]}" alt="${product.ec_name}" style="width: 150px; height: 150px; object-fit: cover;" />
            </li>
          `
            )
            .join('')}
        </ul>
      `
          : `<p>No products found.</p>`
      }
    </body>
  </html>
`;

const getOrCreateClientId = async () => {
  const cookieStore = await cookies();
  const existingClientId = cookieStore.get(COOKIE_NAME);
  if (existingClientId) {
    return {
      value: existingClientId.value,
      status: 'retrieved',
    };
  } else {
    const newClientId = crypto.randomUUID();
    return {
      value: newClientId,
      status: 'generated',
    };
  }
};

export const GET = async (request: Request) => {
  const staticallyRendered = config?.output;

  if (staticallyRendered) {
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Setup Instructions</title>
        </head>
        <body>
          ${nav}
          ${setupInstructions}
        </body>
      </html>
    `;

    return new Response(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  const {value: clientId, status: cliendIdStatus} = await getOrCreateClientId();

  const query = 'kayak';
  const userAgent = request.headers.get('user-agent') || '';
  const locationUrl = request.url;
  const referrer = request.headers.get('referer') || '';

  const searchResults = await search(
    query,
    clientId,
    userAgent,
    locationUrl,
    referrer
  );

  const products: Product[] = searchResults.success
    ? searchResults.data.products || []
    : [];

  const htmlResponse = generateHtmlResponse(clientId, cliendIdStatus, products);

  return new Response(htmlResponse, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': `${COOKIE_NAME}=${clientId}; Path=/;`,
    },
  });
};
