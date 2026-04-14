import {execSync} from 'node:child_process';

const FALLBACK_URL = 'http://storybook.localhost:1355';

export function getStorybookUrl() {
  try {
    return execSync('npx portless get storybook', {
      encoding: 'utf8',
      timeout: 5000,
    }).trim();
  } catch (error) {
    console.warn(
      `[portless] Could not resolve storybook URL, using fallback ${FALLBACK_URL}: ${error.message}`
    );
    return FALLBACK_URL;
  }
}
