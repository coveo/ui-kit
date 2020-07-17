const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const lint = require('@commitlint/lint');
const conventialConfig = require('@commitlint/config-conventional');
const lernaConfig = require('@commitlint/config-lerna-scopes');

const getCommitMessage = async () => {
  const {stdout, stderr} = await exec('git log -1 --pretty=%B');
  if (stderr !== '') {
    throw stderr;
  }
  return stdout;
};

const getLernaPackages = async () => {
  return await lernaConfig.rules['scope-enum']();
};

const getCommitlintConfig = async () => {
  const packages = await getLernaPackages();
  return {
    ...conventialConfig.rules,
    'scope-enum': packages,
  };
};

const main = async () => {
  const message = await getCommitMessage();
  console.log(message);
  const config = await getCommitlintConfig();

  const report = await lint.default(message, config);

  if (!report.valid) {
    console.log(report.errors);
    process.exit(1);
  }
  if (report.warnings.length !== 0) {
    console.log(report.warnings);
  }
};

main();
