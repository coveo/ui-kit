import {execSync} from 'node:child_process';

const sanitizePort = parseInt(process.env.PORT, 10).toString();
execSync(`pnpm storybook dev -p ${sanitizePort} -h 127.0.0.1`, {
  stdio: 'inherit',
});
