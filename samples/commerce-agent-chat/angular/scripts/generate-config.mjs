import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const angularRoot = path.resolve(scriptDir, '..');
const sampleRoot = path.resolve(angularRoot, '..');

const envCandidates = [
  path.resolve(sampleRoot, '.env.local'),
  path.resolve(sampleRoot, '.env'),
];

const publicDir = path.resolve(angularRoot, 'public');
const targetFile = path.resolve(publicDir, 'config.json');

const defaults = {
  VITE_AGENT_MODE: 'local',
  VITE_AGENT_URL: '/api',
  VITE_ORG_ID: '',
  VITE_ACCESS_TOKEN: '',
  VITE_PLATFORM_URL: '',
  VITE_TRACKING_ID: '',
  VITE_LANGUAGE: 'en',
  VITE_COUNTRY: 'US',
  VITE_CURRENCY: 'USD',
  VITE_TIMEZONE: 'America/Montreal',
  VITE_CLIENT_ID: '',
  VITE_CONTEXT_URL: 'https://example.com',
};

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, {recursive: true});
}

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
if (!envPath) {
  console.warn('[generate-config] No .env.local or .env found; using defaults');
}

const envValues = {
  ...defaults,
  ...(envPath ? parseEnvFile(fs.readFileSync(envPath, 'utf8')) : {}),
};

const config = {
  agentMode: envValues.VITE_AGENT_MODE,
  agentUrl: envValues.VITE_AGENT_URL,
  orgId: envValues.VITE_ORG_ID,
  accessToken: envValues.VITE_ACCESS_TOKEN,
  platformUrl: envValues.VITE_PLATFORM_URL,
  trackingId: envValues.VITE_TRACKING_ID,
  language: envValues.VITE_LANGUAGE,
  country: envValues.VITE_COUNTRY,
  currency: envValues.VITE_CURRENCY,
  timezone: envValues.VITE_TIMEZONE,
  clientId: envValues.VITE_CLIENT_ID,
  contextUrl: envValues.VITE_CONTEXT_URL,
};

fs.writeFileSync(targetFile, JSON.stringify(config, null, 2), 'utf8');
const sourceName = envPath ? path.basename(envPath) : 'defaults';
console.log(`[generate-config] Generated config.json from ${sourceName}`);

function parseEnvFile(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    const value = normalizeEnvValue(match[2]);
    result[key] = value;
  }
  return result;
}

function normalizeEnvValue(value) {
  let normalized = value.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}
