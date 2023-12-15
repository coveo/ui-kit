import * as fs from 'fs';

const rawdata = fs.readFileSync('dist/parsed_doc.json', 'utf8');
const rawSSRdata = fs.readFileSync('dist/ssr_parsed_doc.json', 'utf8');

const parsed_doc = JSON.parse(rawdata);
const ssr_parsed_doc = JSON.parse(rawSSRdata);

function logSSRProgress() {
  const args = process.argv.slice(2);

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
      console.log(
        useCase.name + ' ' + counter + '/' + useCase.controllers.length
      );
    } else {
      console.log('There is no SSR use case for ' + useCase.name);
    }
  });
}

logSSRProgress();
