// scripts/reports/pr-review-times/storage.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DATA_DIR = path.resolve(__dirname, 'data');

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
}

/**
 * Save PR data to JSON file
 * @param {object} data Should contain at least { prNumber: ... }
 */
export function savePrData(data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${data.prNumber}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Check if data exists for a PR
 * @param {number} prNumber
 */
export function prDataExists(prNumber) {
  const filePath = path.join(DATA_DIR, `${prNumber}.json`);
  return fs.existsSync(filePath);
}

/**
 * Get the updated_at timestamp from stored PR data.
 * Returns null if file doesn't exist or doesn't have the field.
 * @param {number} prNumber
 */
export function getStoredPrMetadata(prNumber) {
  const filePath = path.join(DATA_DIR, `${prNumber}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    return {
      updatedAt: json.updatedAt || null,
    };
  } catch (_e) {
    return null;
  }
}

/**
 * Load PR data from JSON file
 * @param {number} prNumber
 */
export function loadPrData(prNumber) {
  const filePath = path.join(DATA_DIR, `${prNumber}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * Load all stored PR data
 */
export function loadAllPrData() {
  ensureDataDir();
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  return files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8'))
  );
}
