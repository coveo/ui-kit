import fs from 'fs';
import {execute} from '../../exec.mjs';

async function buildHeadless() {
  await execute('npx', ['nx', 'run', 'headless:build']);
}

function getParsedDoc() {
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

  return {parsed_doc, ssr_parsed_doc};
}

async function prepareData(parsed_doc, ssr_parsed_doc) {
  let rows = [];
  let logs = [];
  parsed_doc.forEach((useCase) => {
    const ssrUseCase = ssr_parsed_doc.find(
      (ssrUseCase) => ssrUseCase.name === 'ssr.' + useCase.name
    );
    if (ssrUseCase) {
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
          logs.push([useCase.name, controller.initializer.name]);
          //   logs.push(`<b>${useCase.name}</b> : ${controller.initializer.name}`);
        }
      });
      rows.push([
        useCase.name,
        counter,
        useCase.controllers.length,
        Math.round(counter / useCase.controllers.length),
      ]);
    } else {
      rows.push([useCase.name, '0', useCase.controllers.length, '0']);
      logs.push([useCase.name, 'missing SSR support']);
      //   logs.push(`<b>${useCase.name}</b> : missing SSR support`);
    }
  });

  return {rows, logs};
}

function buildVisualReport(rows, logs) {
  const rowsWithColumnsConcatenated = rows.map((row) => '|' + row.join('|'));
  const presentableRows = rowsWithColumnsConcatenated.join('\n');
  // first element of logs wrap with <b> </b>
  // add :
  // add last element

  const logsFormatted = logs.map((log) => {
    const [useCase, controller] = log;
    return `<b>${useCase}</b> : ${controller}<br>`;
  });
  //   const presentableLogs = logsFormatted.join('\n');
  return `
  **SSR Progress**
  
  | Use case | SSR (#) | CSR (#) | Progress (%)
  | ---- |:--------:|:--------:|:------:
  ${presentableRows}
  <details>
  <summary>Detailed logs</summary>
  ${logsFormatted}
</details>
  `;
}

export async function buildSSRProgressReport() {
  await buildHeadless();
  const {parsed_doc, ssr_parsed_doc} = getParsedDoc();
  const {rows, logs} = await prepareData(parsed_doc, ssr_parsed_doc);
  const ssrProgress = buildVisualReport(rows, logs);
  return ssrProgress;
}

console.log(await buildSSRProgressReport());
