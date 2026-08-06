#!/usr/bin/env node
import {exec} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// SSM parameter holding the shared Turborepo remote-cache token.
const SSM_PARAMETER_NAME = '/turborepo/token';

const runCommandAndReturnText = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });

const isAwsAuthenticated = () =>
  runCommandAndReturnText('aws sts get-caller-identity')
    .then(() => true)
    .catch(() => false);

const getTurboToken = () =>
  runCommandAndReturnText(
    `aws ssm get-parameter --name "${SSM_PARAMETER_NAME}" --with-decryption --query Parameter.Value --output text`
  );

const configureTurbo = (token) => {
  const turboDir = './.turbo';
  const configFile = path.join(turboDir, 'config.json');
  if (!fs.existsSync(turboDir)) {
    fs.mkdirSync(turboDir, {recursive: true, mode: 0o700});
  }
  fs.writeFileSync(configFile, `${JSON.stringify({token}, null, 2)}\n`, {
    mode: 0o600,
  });
};

try {
  // CI authenticates via the TURBO_TOKEN env var, so the SSM login is dev-only.
  if (process.env.CI) {
    process.exit(0);
  }

  // Local developers reach SSM through the shared "dev" SSO profile.
  process.env.AWS_PROFILE ??= 'dev';

  if (!(await isAwsAuthenticated())) {
    console.log('⚠️  Not logged in to AWS — skipping Turborepo remote cache login.');
    console.log(
      '   Run "aws sso login --profile dev" then "pnpm install" again to enable remote caching.'
    );
    process.exit(0);
  }

  const token = await getTurboToken();
  if (!token || token === 'None') {
    console.log('⚠️  Could not retrieve TURBO_TOKEN from SSM — remote caching disabled.');
    process.exit(0);
  }

  configureTurbo(token);
  console.log('✅ Logged in to Turborepo — remote caching enabled.');
} catch (error) {
  console.log('⚠️  Error setting up Turborepo remote caching:', error.message);
  console.log('   Remote caching will be disabled.');
}
