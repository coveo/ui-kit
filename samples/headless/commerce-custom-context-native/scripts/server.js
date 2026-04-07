import {generateKeyPairSync} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:https';
import {dirname, join, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
};

const ROUTES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/index.js': 'index.js',
  '/styles.css': 'styles.css',
  '/renderSearchResults.js': 'renderSearchResults.js',
};

function generateSelfSignedCert() {
  const {privateKey} = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {type: 'spki', format: 'pem'},
    privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
  });

  const cert = execSync(
    'openssl req -new -x509 -key /dev/stdin -out /dev/stdout -days 1 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"',
    {input: privateKey, encoding: 'utf-8'}
  );

  return {key: privateKey, cert};
}

const server = createServer(generateSelfSignedCert(), async (req, res) => {
  const fileName = ROUTES[req.url];

  if (!fileName) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
    return;
  }

  try {
    const filePath = join(__dirname, '..', fileName);
    const content = await readFile(filePath, 'utf-8');
    const ext = extname(filePath);
    res.writeHead(200, {'Content-Type': MIME_TYPES[ext]});
    res.end(content);
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}/`);
});
