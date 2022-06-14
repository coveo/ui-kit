const util = require('util');
const fs = require('fs');
const rm = util.promisify(fs.rm);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

function getI18nLocaleKey(key) {
  if (!key.includes('-')) {
    return key;
  }

  const splitKey = key.split('-');
  splitKey[1] = splitKey[1].toUpperCase();
  return splitKey.join('-');
}

async function copyDayjsLocales() {
  const localesJSONData = await readFile('node_modules/dayjs/locale.json');
  const localesData = JSON.parse(localesJSONData);
  let fileContent =
    'export const locales: Record<string, () => Promise<unknown>> = {';
  localesData.forEach((locale) => {
    const key = getI18nLocaleKey(locale.key);
    const mapKey = key.includes('-') ? `'${key}'` : key;
    fileContent += `\n  ${mapKey}: () => import('dayjs/locale/${key}'),`;
  });
  fileContent += '\n};\n';

  const generatedPath = 'src/generated';
  const dayjsLocaleDataPath = `${generatedPath}/dayjs-locales-data.ts`;
  await rm(generatedPath, {recursive: true, force: true});
  await mkdir(generatedPath);
  await writeFile(dayjsLocaleDataPath, fileContent);
}

copyDayjsLocales();
