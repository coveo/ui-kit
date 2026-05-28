import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const CATALOG_NAME = '2.5-edition-wcag-2.2-en.yaml';
const OUTPUT_FILE = 'reports/vpat-2.5-coveo-atomic.md';
const INPUT_FILE = 'reports/openacr.yaml';
const TEMPLATE_FILE = 'scripts/vpat-from-openacr.handlebars';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure @openacr/openacr is available in npx cache
execSync('npx --yes @openacr/openacr --version', {stdio: 'ignore'});

// Locate the catalog file from the npx cache
const catalogPath = execSync(
  `find ~/.npm/_npx -name "${CATALOG_NAME}" -path "*@openacr*" 2>/dev/null | head -1`,
  {encoding: 'utf8'}
).trim();

if (!catalogPath || !existsSync(catalogPath)) {
  throw new Error(
    `Could not locate ${CATALOG_NAME} catalog file. Ensure @openacr/openacr is available via npx.`
  );
}

execSync(
  `npx --yes @openacr/openacr output -f ${INPUT_FILE} -c "${catalogPath}" -o ${OUTPUT_FILE} -t ${TEMPLATE_FILE}`,
  {stdio: 'inherit'}
);
