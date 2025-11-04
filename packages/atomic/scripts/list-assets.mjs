import {copyFileSync, mkdirSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const salesforceDesignSystem = dirname(
  fileURLToPath(
    import.meta.resolve('@salesforce-ux/design-system/package.json')
  )
);

const salesforceDocTypeIcons = readdirSync(
  `${salesforceDesignSystem}/assets/icons/doctype`,
  {
    recursive: true,
    withFileTypes: true,
  }
).toSorted((a, b) => a.name.localeCompare(b.name));

const salesforceStandardIcons = readdirSync(
  `${salesforceDesignSystem}/assets/icons/standard`,
  {
    recursive: true,
    withFileTypes: true,
  }
).toSorted((a, b) => a.name.localeCompare(b.name));

mkdirSync('dist/atomic/assets', {recursive: true});

for (const [icons, subpath] of [
  [salesforceDocTypeIcons, 'doctype'],
  [salesforceStandardIcons, 'standard'],
]) {
  for (const icon of icons) {
    if (icon.isFile() && extname(icon.name) === '.svg') {
      copyFileSync(
        `${salesforceDesignSystem}/assets/icons/${subpath}/${icon.name}`,
        `dist/atomic/assets/${icon.name}`
      );
    }
  }
}

// Copy sparkles icon
copyFileSync(
  `${salesforceDesignSystem}/assets/icons/utility/sparkles.svg`,
  `dist/atomic/assets/sparkles.svg`
);

const files = readdirSync('dist/atomic/assets').toSorted();
writeFileSync('docs/assets.json', JSON.stringify({assets: files}));
