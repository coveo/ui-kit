import {readFileSync, writeFileSync} from 'fs';
import {Config, DocGen} from './doc-json-types';
import {parseControllers} from './controllers-parser';
import {parseEngine} from './engine-parser';
import {parseActions} from './actions-parser';

const DOC_GEN_PATH = './packages/headless/dist/doc.json';
const CONFIG_PATH = './packages/headless/docs.config.json';
const OUTPUT_PATH = './packages/headless/dist/parsed_doc.json';

function parse(docgen: DocGen, config: Config) {
  return {
    engine: parseEngine(),
    controllers: parseControllers(docgen, config),
    actions: parseActions(),
  };
}

const docgen: DocGen = JSON.parse(readFileSync(DOC_GEN_PATH, 'utf8'));
const config: Config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

writeFileSync(OUTPUT_PATH, JSON.stringify(parse(docgen, config), null, 2));
