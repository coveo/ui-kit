function prepareData(oldBundleMap, newBundleMap) {
  console.log('preparing atomic bundle data');

  const allUseCases = new Set([
    ...Object.keys(oldBundleMap),
    ...Object.keys(newBundleMap),
  ]);

  const combinedEntries = Array.from(allUseCases).map((useCase) => {
    const oldSize = oldBundleMap[useCase] || 0;
    const newSize = newBundleMap[useCase] || 0;
    return [useCase, oldSize, newSize];
  });

  return combinedEntries.map((entry) => buildRows(...entry));
}

function buildRows(useCase, oldSize, newSize) {
  const change = oldSize > 0 ? ((newSize - oldSize) * 100) / oldSize : 0;
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
  console.log('building atomic visual report');

  const rowsWithColumnsConcatenated = rows.map((row) => `|${row.join('|')}`);
  const presentableRows = rowsWithColumnsConcatenated.join('\n');
  const tableHead = `
| Entry Point | Old (kb) | New (kb) | Change (%)
| ----------- |:--------:|:--------:|:----------:`;

  const table = [tableHead, presentableRows].join('\n');
  return ['## Atomic Bundle Size', table].join('\n\n');
}

export function buildReport(oldSizes, newSizes) {
  const rows = prepareData(oldSizes, newSizes);
  return buildVisualReport(rows);
}
