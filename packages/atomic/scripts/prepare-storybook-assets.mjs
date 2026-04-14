#!/usr/bin/env node

/**
 * Prepares static assets for Storybook serving.
 *
 * 1. Copies Salesforce Design System icons to .storybook/static/assets/
 * 2. Generates locale JSON files from src/locales.json to src/assets/lang/
 * 3. Generates dayjs locale imports to src/generated/
 *
 * This allows Storybook to run without requiring a full dist build.
 *
 * Usage: node scripts/prepare-storybook-assets.mjs
 */

import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {dirname, extname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageDir = resolve(__dirname, '..');
const srcDir = join(packageDir, 'src');
const assetsDir = join(packageDir, '.storybook', 'static', 'assets');

// ── 1. Copy Salesforce icons ────────────────────────────────────────────────

const salesforceDesignSystem = dirname(
  fileURLToPath(
    import.meta.resolve('@salesforce-ux/design-system/package.json')
  )
);

mkdirSync(assetsDir, {recursive: true});

let iconCount = 0;

for (const [subpath] of [['doctype'], ['standard']]) {
  const icons = readdirSync(
    `${salesforceDesignSystem}/assets/icons/${subpath}`,
    {recursive: true, withFileTypes: true}
  );

  for (const icon of icons) {
    if (icon.isFile() && extname(icon.name) === '.svg') {
      copyFileSync(
        `${salesforceDesignSystem}/assets/icons/${subpath}/${icon.name}`,
        join(assetsDir, icon.name)
      );
      iconCount++;
    }
  }
}

copyFileSync(
  `${salesforceDesignSystem}/assets/icons/utility/sparkles.svg`,
  join(assetsDir, 'sparkles.svg')
);
iconCount++;

console.log(`Copied ${iconCount} asset icons to .storybook/static/assets/`);

// ── 2. Generate locale files ────────────────────────────────────────────────

const localesData = JSON.parse(
  readFileSync(join(srcDir, 'locales.json'), 'utf8')
);

const localesMap = {dev: {}};
for (const [stringKey, stringValues] of Object.entries(localesData)) {
  for (const [localeKey, localeStringValue] of Object.entries(stringValues)) {
    if (!localesMap[localeKey]) {
      localesMap[localeKey] = {};
    }
    localesMap[localeKey][stringKey] = localeStringValue;
    localesMap.dev[stringKey] = stringKey;
  }
}

const langDir = join(srcDir, 'assets/lang');
rmSync(langDir, {recursive: true, force: true});
mkdirSync(langDir, {recursive: true});

for (const [localeKey, localeData] of Object.entries(localesMap)) {
  writeFileSync(join(langDir, `${localeKey}.json`), JSON.stringify(localeData));
}

const generatedDir = join(srcDir, 'generated');
mkdirSync(generatedDir, {recursive: true});

const localesArray = Object.keys(localesMap).map((k) => k.toLowerCase());
writeFileSync(
  join(generatedDir, 'availableLocales.json'),
  JSON.stringify(localesArray)
);

console.log(`Generated ${Object.keys(localesMap).length} locale files`);

// ── 3. Generate dayjs locale imports ────────────────────────────────────────

const dayJsPath = fileURLToPath(import.meta.resolve('dayjs/locale.json'));
const dayJsLocales = JSON.parse(readFileSync(dayJsPath, 'utf8'));

let fileContent =
  'export const locales: Record<string, () => Promise<unknown>> = {';
for (const locale of dayJsLocales) {
  const key = locale.key;
  const parts = key.split('-');
  const i18nKey =
    parts.length > 1 ? `${parts[0]}-${parts[1].toUpperCase()}` : key;
  const mapKey = i18nKey.includes('-') ? `'${i18nKey}'` : i18nKey;
  fileContent += `\n  ${mapKey}: () => import('dayjs/locale/${key}'),`;
}
fileContent += '\n};\n';

writeFileSync(join(generatedDir, 'dayjs-locales-data.ts'), fileContent);

console.log('Generated dayjs-locales-data.ts');
