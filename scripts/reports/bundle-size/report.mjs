function prepareData(oldBundleMap, newBundleMap) {
  console.log('preparing data');

  const oldEntries = Object.entries(oldBundleMap);

  const combinedEntries = oldEntries.map((entry) => {
    const [useCase, oldSize] = entry;
    const newSize = newBundleMap[useCase] || 0;
    return [useCase, oldSize, newSize];
  });

  return combinedEntries.map((entry) => buildRows(...entry));
}

function buildRows(useCase, oldSize, newSize) {
  const change = ((newSize - oldSize) * 100) / oldSize;
  return [useCase, toKb(oldSize), toKb(newSize), toOneDecimal(change)];
}

function toKb(num) {
  const kilobytes = num / 1024;
  return toOneDecimal(kilobytes);
}

function toOneDecimal(num) {
  return Math.round(num * 10) / 10;
}

function buildVisualReport(rows) {
  console.log('building visual report');

  const rowsWithColumnsConcatenated = rows.map((row) => `|${row.join('|')}`);
  const presentableRows = rowsWithColumnsConcatenated.join('\n');
  const tableHead = `
| File | Old (kb) | New (kb) | Change (%)
| ---- |:--------:|:--------:|:------:`;

  const table = [tableHead, presentableRows].join('\n');
  return ['## Bundle Size', table].join('\n\n');
}

export function buildReport(oldSizes, newSizes) {
  const rows = prepareData(oldSizes, newSizes);
  return buildVisualReport(rows);
}
