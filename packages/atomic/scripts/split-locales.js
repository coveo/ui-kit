const util = require('util');
const fs = require('fs');
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

  await rmdir(langFolderPath, {recursive: true});
  await mkdir(langFolderPath, {recursive: true});

  Object.entries(localesMap).forEach(async ([localeKey, localeData]) => {
    await writeFile(
      `${langFolderPath}${localeKey}.json`,
      JSON.stringify(localeData)
    );
  });
}

splitLocales();
