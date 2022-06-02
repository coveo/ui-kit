const util = require('util');
const fs = require('fs');
const rm = util.promisify(fs.rm);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

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

  const generatedPath = 'src/generated';
  const dayjsLocaleDataPath = `${generatedPath}/dayjs-locales-data.ts`;
  await rm(generatedPath, {recursive: true, force: true});
  await mkdir(generatedPath);
  await writeFile(dayjsLocaleDataPath, fileContent);
}

copyDayjsLocales();
