import fs from 'fs-extra';
const {readFileSync, writeFileSync, copySync, copyFileSync} = fs;
import {join, resolve, dirname} from 'path';
import detectIndent from 'detect-indent';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const atomicTemplatePath = resolve(
  __dirname,
  '..',
  '..',
  'create-atomic-template'
);
const bundledTemplatePath = resolve(__dirname, '..', 'template');

copySync(atomicTemplatePath, bundledTemplatePath, {recursive: true});
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
