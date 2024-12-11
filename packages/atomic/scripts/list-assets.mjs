import {copyFileSync, mkdirSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const salesforceDesignSystem = dirname(
  fileURLToPath(
    import.meta.resolve(
      '../../../node_modules/@salesforce-ux/design-system/package.json'
    )
  )
);

const salesforceDocTypeIcons = readdirSync(
  `${salesforceDesignSystem}/assets/icons/doctype`,
  {
    recursive: true,
    withFileTypes: true,
  }
);

const salesforceStandardIcons = readdirSync(
  `${salesforceDesignSystem}/assets/icons/standard`,
  {
    recursive: true,
    withFileTypes: true,
  }
);

mkdirSync('dist/atomic/assets', {recursive: true});

for (const [icons, subpath] of [
  [salesforceDocTypeIcons, 'doctype'],
  [salesforceStandardIcons, 'standard'],
]) {
  for (const icon of icons) {
    if (icon.isFile()) {
      copyFileSync(
        `${salesforceDesignSystem}/assets/icons/${subpath}/${icon.name}`,
        `dist/atomic/assets/${icon.name}`
      );
    }
  }
}

const files = readdirSync('dist/atomic/assets');
writeFileSync('docs/assets.json', JSON.stringify({assets: files}));
