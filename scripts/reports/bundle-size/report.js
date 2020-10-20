function buildReport(oldSizes, newSizes) {
  const rows = prepareData(oldSizes, newSizes);
  return buildVisualReport(rows);
}

function prepareData(oldBundleMaps, newBundleMaps) {
  console.log('preparing data');

  const oldEntries = Object.entries(oldBundleMaps);
  
  const combinedEntries = oldEntries.map(entry => {
    const [bundleName, oldBundleSizeMap] = entry;
    const newBundleSizeMap = newBundleMaps[bundleName] || buildNullSizeMap();
    
    return [bundleName, oldBundleSizeMap, newBundleSizeMap];
  })
  
  return combinedEntries.map(entry => buildRows(...entry));
}

function buildNullSizeMap() {
  return {
    bundled: 0,
    minified: 0,
    gzipped: 0,
  }
}

function buildRows(bundleName, oldSizeMap, newSizeMap) {
  return Object.keys(oldSizeMap)
  .filter(key => isNumeric(oldSizeMap[key]))
  .map((compression, index) => {
    const fileName = index === 0 ? bundleName : '';
    
    const oldSize = oldSizeMap[compression];
    const newSize = newSizeMap[compression];
    const change = (newSize - oldSize) * 100 / oldSize;

    return [fileName, compression, toKb(oldSize), toKb(newSize), toOneDecimal(change)];
  });
}

function toKb(num) {
  const kilobytes = num / 1000;
  return toOneDecimal(kilobytes);
}

function toOneDecimal(num) {
  return Math.round(num * 10) / 10;
}

function isNumeric(value) {
  return typeof value === 'number'
}

function buildVisualReport(rows) {
  console.log('building visual report');

  const rowsCombinedAcrossBundles = rows.reduce((accumulated, current) => accumulated.concat(current), []);
  const rowsWithColumnsConcatenated = rowsCombinedAcrossBundles.map(row => '|' + row.join('|'))
  const presentableRows = rowsWithColumnsConcatenated.join('\n');
  
  return `
  **Bundle Size**
  
  | File | Compression | Old (kb) | New (kb) | Change (%)
  | ---- |:-----------:|:--------:|:--------:|:------:
  ${presentableRows}
  `
}

module.exports = { buildReport }