const fs = require('node:fs');
const path = require('node:path');

/** @type {import('@angular/build/src/utils/load-proxy-config').ProxyConfiguration} */
const coveoPlatformUrl =
  process.env.VITE_PLATFORM_URL ||
  readEnvValue('VITE_PLATFORM_URL') ||
  'https://platform.cloud.coveo.com';

module.exports = {
  '/api/coveo-dev': {
    target: coveoPlatformUrl,
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      '^/api/coveo-dev': '',
    },
  },
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '',
    },
  },
};

function readEnvValue(key) {
  const sampleRoot = path.resolve(__dirname, '..');
  const candidates = [
    path.resolve(sampleRoot, '.env.local'),
    path.resolve(sampleRoot, '.env'),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const raw = fs.readFileSync(candidate, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match || match[1] !== key) {
        continue;
      }

      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (value.length > 0) {
        return value;
      }
    }
  }

  return '';
}
