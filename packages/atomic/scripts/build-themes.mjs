import {cpSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import colors from '../../../utils/ci/colors.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = join(__dirname, '..');
const srcDir = join(packageDir, 'src');
const distRoot = join(packageDir, 'dist');

/**
 * Copy theme CSS files to dist/themes.
 */
function copyThemes() {
  mkdirSync(join(distRoot, 'themes'), {recursive: true});
  cpSync(join(srcDir, 'themes'), join(distRoot, 'themes'), {
    recursive: true,
  });
  console.log(colors.bgGreen('Copied'), colors.green('themes/ → dist/themes/'));
}

copyThemes();

console.log(colors.bold.blue('Themes build complete'));
