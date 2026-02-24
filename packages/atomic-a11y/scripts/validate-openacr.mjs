#!/usr/bin/env node

/**
 * Validates an OpenACR YAML file against the official GSA JSON Schema.
 *
 * Schema source: https://github.com/GSA/openacr/blob/main/schema/openacr-0.1.0.json
 *
 * Run manually:  node scripts/validate-openacr.mjs [path/to/openacr.yaml]
 * Run via npm:   pnpm a11y:validate
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import Ajv from 'ajv';
import yaml from 'js-yaml';

const LOG_PREFIX = '[validate-openacr]';
const SCHEMA_URL =
  'https://raw.githubusercontent.com/GSA/openacr/main/schema/openacr-0.1.0.json';
const DEFAULT_INPUT = 'reports/openacr.yaml';

async function fetchSchema() {
  const response = await fetch(SCHEMA_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenACR schema: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

function loadYaml(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

async function main() {
  const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);

  console.log(LOG_PREFIX, `Fetching official OpenACR schema from GSA...`);
  const schema = await fetchSchema();

  console.log(LOG_PREFIX, `Validating ${inputPath}...`);
  const data = loadYaml(inputPath);

  const ajv = new Ajv({allErrors: true});
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    console.log(
      LOG_PREFIX,
      `✓ OpenACR output conforms to the official GSA schema.`
    );
  } else {
    console.error(
      LOG_PREFIX,
      `✗ OpenACR output does NOT conform to the official GSA schema.`
    );
    console.error(LOG_PREFIX, `Validation errors:`);
    for (const error of validate.errors) {
      console.error(
        LOG_PREFIX,
        `  - ${error.instancePath || '(root)'}: ${error.message}`
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(LOG_PREFIX, err.message);
  process.exit(1);
});
