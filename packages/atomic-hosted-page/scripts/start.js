import {execSync, spawn} from 'node:child_process';

const startWsServer = () => {
  const wsServer = spawn('pnpm', ['exec', 'ws', '-p', '3333', '-d', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  wsServer.on('error', (err) => {
    console.error('Failed to start the ws server:', err);
    process.exit(1);
  });
};

const startViteServer = () => {
  console.log('Starting Vite server...');
  execSync('vite serve dev --port 3333', {stdio: 'inherit'});
};

try {
  if (process.env.DEPLOYMENT_ENVIRONMENT === 'CDN') {
    startWsServer();
  } else {
    startViteServer();
  }
} catch (err) {
  console.error('An error occurred:', err);
  process.exit(1);
}
