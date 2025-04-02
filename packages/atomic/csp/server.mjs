import {createReadStream} from 'node:fs';
import {createServer} from 'node:http';
import {resolve} from 'node:path';

const __dirname = import.meta.dirname;

function tableFlip(res) {
  res.statusCode = 404;
  res.end('File not found');
}

function getContentTypeFromExtension(filePath) {
  const extension = /\.(html|json|js|css|svg|ico)$/.exec(filePath);

  if (!extension) {
    return;
  }
  switch (extension[1]) {
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'js':
      return 'text/javascript';
    case 'css':
      return 'text/css';
    case 'svg':
      return 'image/svg+xml';
    case 'ico':
      return 'image/x-icon';
  }
}
const server = createServer((req, res) => {
  const filePath = resolve(
    __dirname,
    '../www',
    req.url.slice(1) || 'index.html'
  );
  const contentType = getContentTypeFromExtension(filePath);
  if (!contentType) {
    // Handle unknown file types
    tableFlip(res);
    return;
  } else {
    res.setHeader('Content-Type', contentType);
  }
  const fileStream = createReadStream(filePath);
  // Handle file not found/fs errors
  fileStream.on('error', () => {
    tableFlip(res);
  });
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Disallow inline script/style, except with a nonce
  res.setHeader('Content-Security-Policy', [
    "script-src 'self' 'nonce-1234567890'",
    "style-src 'self' 'nonce-1234567890'",
  ]);
  fileStream.pipe(res);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
  process.send('ready');
});
