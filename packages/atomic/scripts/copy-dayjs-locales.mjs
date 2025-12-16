import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function getI18nLocaleKey(key) {
  if (!key.includes('-')) {
    return key;
  }

  const splitKey = key.split('-');
  splitKey[1] = splitKey[1].toUpperCase();
  return splitKey.join('-');
}

async function copyDayjsLocales() {
  const dayJsPath = fileURLToPath(import.meta.resolve('dayjs/locale.json'));
  const localesJSONData = await readFile(dayJsPath);
  const localesData = JSON.parse(localesJSONData);
  let fileContent =
    'export const locales: Record<string, () => Promise<unknown>> = {';
  localesData.forEach((locale) => {
    const key = locale.key;
    const i18nKey = getI18nLocaleKey(locale.key);
    const mapKey = i18nKey.includes('-') ? `'${i18nKey}'` : i18nKey;
    fileContent += `\n  ${mapKey}: () => import('dayjs/locale/${key}'),`;
  });
  fileContent += '\n};\n';

  const generatedPath = 'src/generated';
  const dayjsLocaleDataPath = `${generatedPath}/dayjs-locales-data.ts`;
  await writeFile(dayjsLocaleDataPath, fileContent);
}

copyDayjsLocales();
