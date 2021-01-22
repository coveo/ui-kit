const fs = require('fs');
const localesJSONData = fs.readFileSync('src/locales.json');

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

fs.mkdir(
  'src/components/atomic-search-interface/lang/',
  {recursive: true},
  (err) => {
    if (err) throw err;
    Object.entries(localesMap).forEach(([localeKey, localeData]) => {
      fs.writeFileSync(
        `src/components/atomic-search-interface/lang/${localeKey}.json`,
        JSON.stringify(localeData)
      );
    });
  }
);
