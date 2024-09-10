import {exec} from 'child_process';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {argv} from 'process';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '../../headless/package.json');
let version;

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  version = 'v' + packageJson.version;
  console.log('Version:', version);
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

const command = `
  find ../../packages/atomic/www/build ../../packages/atomic/dist -type f -exec sed -i '' \
  -e 's/@coveo\\/headless\\/commerce/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/commerce\\/headless.esm.js/g' \
  -e 's/@coveo\\/headless\\/insight/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/insight\\/headless.esm.js/g' \
  -e 's/@coveo\\/headless\\/product-recommendations/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/product-recommendations\\/headless.esm.js/g' \
  -e 's/@coveo\\/headless\\/recommendation/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/recommendation\\/headless.esm.js/g' \
  -e 's/@coveo\\/headless\\/case-assist/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/case-assist\\/headless.esm.js/g' \
  -e 's/@coveo\\/headless/https:\\/\\/static.cloud.coveo.com\\/headless\\/${version}\\/headless.esm.js/g' {} +`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
