const util = require('util');
const fs = require('fs');
const mkdir = util.promisify(fs.mkdir);
const rm = util.promisify(fs.rm);
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const ncp = util.promisify(require('ncp'));

async function splitLocales() {
  const localesJSONData = await readFile('src/locales.json');
  // Map of string keys composed of different locales and their values.
  const localesData = JSON.parse(localesJSONData);

  // Map of locales composed by different string keys and their values.
  const localesMap = {
    // Troubleshooting locale used to identify string keys
    dev: {},
  };

  for (const [stringKey, stringValues] of Object.entries(localesData)) {
    for (const [localeKey, localeStringValue] of Object.entries(stringValues)) {
      if (!localesMap[localeKey]) {
        localesMap[localeKey] = {};
      }
      localesMap[localeKey][stringKey] = localeStringValue;
      localesMap.dev[stringKey] = stringKey;
    }
  }

  const langFolderPath = 'src/components/atomic-search-interface/lang/';

  await rm(langFolderPath, {recursive: true, force: true});
  await mkdir(langFolderPath, {recursive: true});

  Object.entries(localesMap).forEach(async ([localeKey, localeData]) => {
    await writeFile(
      `${langFolderPath}${localeKey}.json`,
      JSON.stringify(localeData)
    );
  });

  const dayjsLangFolderPath = `${langFolderPath}/dayjs`;
  await mkdir(dayjsLangFolderPath);
  await ncp('node_modules/dayjs/esm/locale', dayjsLangFolderPath);

  const filePaths = await readdir(dayjsLangFolderPath);
  filePaths.forEach(async (fileName) => {
    const filePath = `${dayjsLangFolderPath}/${fileName}`;
    const fileContent = await readFile(filePath, 'utf-8');
    const updatedContent = fileContent
      .replace("import dayjs from '../index';", '')
      .replace('dayjs.locale(locale, null, true);', '');

    await writeFile(filePath, updatedContent, 'utf-8');
  });
}

splitLocales();
