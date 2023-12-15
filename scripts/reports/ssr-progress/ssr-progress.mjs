import fs from 'fs';

const rawdata = fs.readFileSync(
  'packages/headless/dist/parsed_doc.json',
  'utf8'
);
const rawSSRdata = fs.readFileSync(
  'packages/headless/dist/ssr_parsed_doc.json',
  'utf8'
);

const parsed_doc = JSON.parse(rawdata);
const ssr_parsed_doc = JSON.parse(rawSSRdata);

function toOneDecimal(num) {
  return Math.round(num * 10) / 10;
}

function prepareData() {
  const args = process.argv.slice(2);
  let rows = [];

  parsed_doc.forEach((useCase) => {
    const ssrUseCase = ssr_parsed_doc.find(
      (ssrUseCase) => ssrUseCase.name === 'ssr.' + useCase.name
    );
    if (ssrUseCase !== undefined) {
      let counter = 0;
      useCase.controllers.forEach((controller) => {
        if (
          ssrUseCase.controllers.find(
            (ssrController) =>
              ssrController.definer ===
              'define' + controller.initializer.name.substring(5)
          )
        ) {
          counter += 1;
        } else {
          if (args[0] === '-d') {
            console.log(controller.initializer.name);
          }
        }
      });
      rows.push([
        useCase.name,
        counter,
        useCase.controllers.length,
        toOneDecimal(counter / useCase.controllers.length),
      ]);

      console.log(
        useCase.name + ' ' + counter + '/' + useCase.controllers.length
      );
    } else {
      console.log('There is no SSR use case for ' + useCase.name);
      rows.push([
        useCase.name,
        '0',
        useCase.controllers.length,
        'SSR is not supported',
      ]);
    }
  });

  return rows;
}
function buildVisualReport(rows) {
  const rowsWithColumnsConcatenated = rows.map((row) => '|' + row.join('|'));
  const presentableRows = rowsWithColumnsConcatenated.join('\n');
  return `
  **SSR Progress**
  
  | Use case | SSR (#) | CSR (#) | Progress (%)
  | ---- |:--------:|:--------:|:------:
  ${presentableRows}
  `;
}

export async function buildSSRProgressReport() {
  const rows = prepareData();
  const ssrProgress = buildVisualReport(rows);
  return ssrProgress;
}

console.log(buildSSRProgressReport());
