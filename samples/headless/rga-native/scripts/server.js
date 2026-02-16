import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
};

const server = createServer(async (req, res) => {
  let filePath;

  if (req.url === '/' || req.url === '/index.html') {
    filePath = join(__dirname, '..', 'index.html');
  } else if (req.url === '/index.js') {
    filePath = join(__dirname, '..', 'index.js');
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
    return;
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const ext = filePath.endsWith('.html') ? '.html' : '.js';
    res.writeHead(200, {'Content-Type': MIME_TYPES[ext]});
    res.end(content);
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
