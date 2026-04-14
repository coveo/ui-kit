import {execSync} from 'node:child_process';
import {resolve} from 'node:path';
import {getManagedHostnames} from 'portless';
const FALLBACK_URL = 'http://storybook.localhost:1355';

export function getStorybookUrl() {
  try {
    return execSync('pnpm portless get storybook', {
      encoding: 'utf8',
      timeout: 5000,
      cwd: resolve(import.meta.dirname, '..'),
    }).trim();
  } catch (error) {
    console.warn(
      `[portless] Could not resolve storybook URL, using fallback ${FALLBACK_URL}: ${error.message}`
    );
    return FALLBACK_URL;
  }
}
