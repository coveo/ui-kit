const util = require('util');
const fs = require('fs');
const rm = util.promisify(fs.rm);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function copyDayjsLocales() {
  const localesJSONData = await readFile('node_modules/dayjs/locale.json');
  const localesData = JSON.parse(localesJSONData);
  let fileContent =
    'export const locales: Record<string, () => Promise<unknown>> = {';

  localesData.forEach((locale) => {
    const key = locale.key.includes('-') ? `'${locale.key}'` : locale.key;
    fileContent += `\n  ${key}: () => import('dayjs/locale/${locale.key}'),`;
  });

  fileContent += '\n};\n';
  const dayjsLocaleDataPath = 'src/generated/dayjs-locales-data.ts';
  await rm(dayjsLocaleDataPath, {force: true});
  await writeFile(dayjsLocaleDataPath, fileContent);
}

copyDayjsLocales();
