const {getPullRequestTitle} = require('../github-client');

const load = require('@commitlint/load').default;
const lint = require('@commitlint/lint').default;

const specUrl = 'https://www.conventionalcommits.org/en/v1.0.0/#summary';

async function buildTitleReport() {
  const prTitle = (await getPullRequestTitle()) || '';
  const {valid} = await analyze(prTitle);
  const isTitleValid = prTitle && valid;

  return buildReport(isTitleValid);
}

async function analyze(title) {
  const {rules, parserPreset} = await getLinterConfiguration();
  return await lint(title, rules, parserPreset || {});
}

async function getLinterConfiguration() {
  const conventionalConfig = {extends: ['@commitlint/config-conventional']};
  return await load(conventionalConfig);
}

function buildReport(isTitleValid) {
  const message = isTitleValid ? buildSuccessMessage() : buildErrorMessage();

  return `
  **PR Title**

  ${message}
  `;
}

function buildSuccessMessage() {
  return `
  :white_check_mark: Title follows the [conventional commit](${specUrl}) spec.
  `;
}

function buildErrorMessage() {
  return `
  :x: Title should follow the [conventional commit](${specUrl}) spec:
  
  <type>(optional scope): <description>

  Example:
  
  feat(headless): add result-list controller
  `;
}

module.exports = {buildTitleReport};
