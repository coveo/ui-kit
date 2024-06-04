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
  const parsed_doc = JSON.parse(rawdata);

  return parsed_doc;
}

function removeControllersWithNoSSRSupport(useCase) {
  if (useCase.name === 'search') {
    return useCase.controllers.filter((controller) => {
      return controller.initializer.name !== 'buildUrlManager';
    });
  }
}

function checkControllerDefiner(ssrController, controller) {
  return (
    ssrController.initializer.name ===
    'define' + controller.initializer.name.substring(5)
  );
}

function prepareData(parsed_doc) {
  let rows = [];
  let logs = [];
  parsed_doc.forEach((useCase) => {
    if (useCase.name.startsWith('ssr-')) return;

    const ssrUseCase = parsed_doc.find(
      (ssrUseCase) => ssrUseCase.name === 'ssr-' + useCase.name
    );
    if (ssrUseCase) {
      let counter = 0;
      const useCaseControllers = removeControllersWithNoSSRSupport(useCase);
      useCaseControllers.forEach((controller) => {
        if (
          ssrUseCase.controllers.find((ssrController) =>
            checkControllerDefiner(ssrController, controller)
          )
        ) {
          counter += 1;
        } else {
          logs.push([useCase.name, controller.initializer.name]);
        }
      });
      rows.push([
        useCase.name,
        counter,
        useCaseControllers.length,
        Math.round((counter / useCaseControllers.length) * 100),
      ]);
    } else {
      rows.push([useCase.name, '0', useCase.controllers.length, '0']);
      logs.push([useCase.name, 'missing SSR support']);
    }
  });

  return {rows, logs};
}

function buildVisualReport(rows, logs) {
  const rowsWithColumnsConcatenated = rows.map((row) => '|' + row.join('|'));
  const printableRows = rowsWithColumnsConcatenated.join('\n');
  const logsFormatted = logs.map((log) => {
    const [useCase, controller] = log;
    return `<b>${useCase}</b> : ${controller}<br>`;
  });
  const printableLogs = logsFormatted.join(' ');
  const tableHeader = `
| Use case | SSR (#) | CSR (#) | Progress (%)
| ---- |:--------:|:--------:|:------:`;
  const detailedLogs = `
<details>
  <summary>Detailed logs</summary>
  ${printableLogs}
</details>`;
  const message = [tableHeader, printableRows, detailedLogs].join('\n');
  return ['## SSR Progress', message].join('\n\n');
}

export async function buildSSRProgressReport() {
  await buildHeadless();
  const parsed_doc = getParsedDoc();
  const {rows, logs} = prepareData(parsed_doc);
  const ssrProgress = buildVisualReport(rows, logs);
  return ssrProgress;
}
