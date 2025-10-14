import {copyFileSync, cpSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * Detects the indentation used in a string.
 * @param {string} str - The string to analyze
 * @returns {{indent: string, amount: number, type: 'tab' | 'space' | undefined}} The detected indentation
 */
function detectIndent(str) {
  const tabMatch = str.match(/^(\t+)/m);
  if (tabMatch) {
    return {
      indent: '\t',
      amount: 1,
      type: 'tab',
    };
  }

  const spaceMatch = str.match(/^( +)/m);
  if (spaceMatch) {
    const amount = spaceMatch[1].length;
    return {
      indent: ' '.repeat(amount),
      amount,
      type: 'space',
    };
  }

  return {
    indent: '',
    amount: 0,
    type: undefined,
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const atomicTemplatePath = resolve(
  __dirname,
  '..',
  '..',
  'create-atomic-template'
);
const bundledTemplatePath = resolve(__dirname, '..', 'template');

cpSync(atomicTemplatePath, bundledTemplatePath, {recursive: true});
copyFileSync(
  join(__dirname, '!.eslintrc'),
  join(bundledTemplatePath, '.eslintrc')
);

const packageJson = readFileSync(
  join(bundledTemplatePath, 'package.json'),
  'utf-8'
);

const packageTemplate = readFileSync(
  resolve(__dirname, 'packageTemplate.json'),
  'utf-8'
);

const pkgIndent = detectIndent(packageTemplate).indent || '\t';
const finalPackageJsonTemplate = JSON.parse(packageTemplate);
const packageJsonObject = JSON.parse(packageJson);

finalPackageJsonTemplate.dependencies = packageJsonObject.dependencies;
finalPackageJsonTemplate.devDependencies = packageJsonObject.devDependencies;

writeFileSync(
  resolve(__dirname, '..', 'template', 'package.json.hbs'),
  JSON.stringify(finalPackageJsonTemplate, undefined, pkgIndent)
);
