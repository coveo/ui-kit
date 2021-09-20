const {resolve} = require('path');
const {readFileSync} = require('fs');
const {execSync} = require('child_process');

const path = resolve(process.cwd(), process.argv[2]);
const pathToPackageJSON = resolve(path, './package.json');

/**
 * @type {{ name: string, version: string }}
 */
const pkg = JSON.parse(readFileSync(pathToPackageJSON));

const packageRef = `${pkg.name}@${pkg.version}`;

const exists = !!execSync(`npm view ${packageRef}`).toString().length;

process.exit(exists ? 0 : 1);
