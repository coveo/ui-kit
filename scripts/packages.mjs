import {readFileSync} from 'fs';

export const packageDirsNpmTag = [
  'atomic',
  'auth',
  'bueno',
  'headless',
  'atomic-react',
  'atomic-angular/projects/atomic-angular',
  'quantic',
];

export const packageDirsSnyk = ['headless', 'atomic'];

/**
 * @param {string} fullPath
 * @returns {{name: string, version: string}}
 */
export function getPackageFromPath(fullPath) {
  const {name, version} = JSON.parse(readFileSync(fullPath).toString());
  return {name, version};
}
