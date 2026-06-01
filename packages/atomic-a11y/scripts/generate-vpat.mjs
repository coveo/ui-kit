import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {parse} from 'yaml';
import {renderVpat} from '../dist/index.js';

const OUTPUT_FILE = 'reports/vpat-2.5-coveo-atomic.md';
const INPUT_FILE = 'reports/openacr.yaml';
const CATALOG_FILE = 'a11y/catalog/2.5-edition-wcag-2.2-en.yaml';
const TEMPLATE_FILE = 'scripts/vpat-from-openacr.handlebars';

const openAcrData = parse(readFileSync(INPUT_FILE, 'utf8'));
const catalog = parse(readFileSync(CATALOG_FILE, 'utf8'));
const templateSource = readFileSync(TEMPLATE_FILE, 'utf8');

const markdown = renderVpat(openAcrData, catalog, templateSource);

mkdirSync(path.dirname(OUTPUT_FILE), {recursive: true});
writeFileSync(OUTPUT_FILE, markdown);

console.log(`[generate-vpat] ✓ VPAT written to ${OUTPUT_FILE}`);
