import {execSync, spawn} from 'node:child_process';

const startWsServer = () => {
  const wsServer = spawn(
    'pnpm',
    [
      '--filter',
      '@coveo/cdn',
      'exec',
      '--',
      'ws',
      '--port',
      '3333',
      '-d',
      'dev',
    ],
    {
      stdio: 'inherit',
    }
  );

  const handleSignal = (signal) => {
    if (wsServer.exitCode !== null || wsServer.signalCode !== null) {
      process.exit(0);
      return;
    }

    wsServer.kill(signal);

    setTimeout(() => {
      if (wsServer.exitCode === null && wsServer.signalCode === null) {
        wsServer.kill('SIGKILL');
      }
    }, 400);
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => handleSignal(signal));
  });

  wsServer.on('exit', (code, signal) => {
    if (signal) {
      process.exit(0);
      return;
    }

    process.exit(code ?? 0);
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
