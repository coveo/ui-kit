import {cpSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import colors from '../../../utils/ci/colors.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = join(__dirname, '..');
const srcDir = join(packageDir, 'src');
const distRoot = join(packageDir, 'dist');

/**
 * Split src/locales.json into per-locale JSON files under src/assets/lang/
 * and write src/generated/availableLocales.json.
 */
function generateLocales() {
  const generatedDir = join(srcDir, 'generated');
  rmSync(generatedDir, {recursive: true, force: true});
  mkdirSync(generatedDir, {recursive: true});

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
    writeFileSync(
      join(langDir, `${localeKey}.json`),
      JSON.stringify(localeData)
    );
  }

  const localesArray = Object.keys(localesMap).map((k) => k.toLowerCase());
  writeFileSync(
    join(generatedDir, 'availableLocales.json'),
    JSON.stringify(localesArray)
  );

  console.log(
    colors.bgGreen(`Generated ${Object.keys(localesMap).length} locale files`)
  );
}

/**
 * Generate src/generated/dayjs-locales-data.ts with dynamic imports for all dayjs locales.
 */
function generateDayjsLocales() {
  const dayJsPath = fileURLToPath(import.meta.resolve('dayjs/locale.json'));
  const localesData = JSON.parse(readFileSync(dayJsPath, 'utf8'));

  let fileContent =
    'export const locales: Record<string, () => Promise<unknown>> = {';
  for (const locale of localesData) {
    const key = locale.key;
    const parts = key.split('-');
    const i18nKey =
      parts.length > 1 ? `${parts[0]}-${parts[1].toUpperCase()}` : key;
    const mapKey = i18nKey.includes('-') ? `'${i18nKey}'` : i18nKey;
    fileContent += `\n  ${mapKey}: () => import('dayjs/locale/${key}'),`;
  }
  fileContent += '\n};\n';

  writeFileSync(join(srcDir, 'generated/dayjs-locales-data.ts'), fileContent);
  console.log(
    colors.bgGreen('Generated'),
    colors.green('dayjs-locales-data.ts')
  );
}

/**
 * Copy generated lang files to dist/lang.
 */
function copyLangToDist() {
  mkdirSync(join(distRoot, 'lang'), {recursive: true});
  cpSync(join(srcDir, 'assets/lang'), join(distRoot, 'lang'), {
    recursive: true,
  });
  console.log(colors.bgGreen('Copied'), colors.green('lang/ → dist/lang/'));
}

generateLocales();
generateDayjsLocales();
copyLangToDist();

console.log(colors.bold.blue('Locale build complete'));
