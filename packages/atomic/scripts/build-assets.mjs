import {copyFileSync, mkdirSync, readdirSync} from 'node:fs';
import {dirname, extname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import colors from '../../../utils/ci/colors.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = join(__dirname, '..');
const distRoot = join(packageDir, 'dist');

/**
 * Copy Salesforce Design System icons to dist/assets.
 */
function listAssets() {
  const salesforceDesignSystem = dirname(
    fileURLToPath(
      import.meta.resolve('@salesforce-ux/design-system/package.json')
    )
  );

  const salesforceDocTypeIcons = readdirSync(
    `${salesforceDesignSystem}/assets/icons/doctype`,
    {recursive: true, withFileTypes: true}
  ).toSorted((a, b) => a.name.localeCompare(b.name));

  const salesforceStandardIcons = readdirSync(
    `${salesforceDesignSystem}/assets/icons/standard`,
    {recursive: true, withFileTypes: true}
  ).toSorted((a, b) => a.name.localeCompare(b.name));

  const assetsDir = join(distRoot, 'assets');
  mkdirSync(assetsDir, {recursive: true});

  let count = 0;
  for (const [icons, subpath] of [
    [salesforceDocTypeIcons, 'doctype'],
    [salesforceStandardIcons, 'standard'],
  ]) {
    for (const icon of icons) {
      if (icon.isFile() && extname(icon.name) === '.svg') {
        copyFileSync(
          `${salesforceDesignSystem}/assets/icons/${subpath}/${icon.name}`,
          join(assetsDir, icon.name)
        );
        count++;
      }
    }
  }

  // Copy sparkles icon
  copyFileSync(
    `${salesforceDesignSystem}/assets/icons/utility/sparkles.svg`,
    join(assetsDir, 'sparkles.svg')
  );
  count++;

  console.log(colors.bgGreen(`Copied ${count} asset icons`));
}

listAssets();

console.log(colors.bold.blue('Assets build complete'));
