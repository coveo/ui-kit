/* eslint-disable no-process-exit */
/* eslint-disable node/no-unpublished-require */

const lint = require('@commitlint/lint');
const conventialConfig = require('@commitlint/config-conventional');
const lernaConfig = require('@commitlint/config-lerna-scopes');

const getLernaPackages = async () => {
  return await lernaConfig.rules['scope-enum']();
};

const lintCommitMessage = async (message) => {
  const packages = await getLernaPackages();
  const report = await lint.default(message, {
    ...conventialConfig.rules,
    'scope-enum': packages,
  });

  if (!report.valid) {
    logLintErrors(report.errors);
    throw 'Use `npm run commit` to build proper commit message.';
  }

  console.log('Commit message linted properly');
};

const logLintErrors = (errors) => {
  console.log(errors.reduce((prev, next) => prev + next.message + '\n', '\n'));
};


module.exports = {lintCommitMessage};
