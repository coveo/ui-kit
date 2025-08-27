import fs from 'node:fs';
import {promisify} from 'node:util';

const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

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

  const langFolderPath = 'src/assets/lang/';

  await rm(langFolderPath, {recursive: true, force: true});
  await mkdir(langFolderPath, {recursive: true});

  Object.entries(localesMap).forEach(async ([localeKey, localeData]) => {
    await writeFile(
      `${langFolderPath}${localeKey}.json`,
      JSON.stringify(localeData)
    );
  });

  await saveAvailableLocales(localesMap);
}

async function saveAvailableLocales(localesMap) {
  const generatedPath = 'src/generated';
  const localesArray = Object.entries(localesMap).map(([localeKey]) =>
    localeKey.toLowerCase()
  );

  await writeFile(
    `${generatedPath}/availableLocales.json`,
    JSON.stringify(localesArray)
  );
}

splitLocales();
