import {getPullRequestTitle} from '../github-client.mjs';

const specUrl = 'https://www.conventionalcommits.org/en/v1.0.0/#summary';

function isValidConventionalCommit(title) {
  if (!title || typeof title !== 'string') {
    return false;
  }

  const conventionalCommitRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+/;

  return conventionalCommitRegex.test(title.trim());
}

function analyze(title) {
  const valid = isValidConventionalCommit(title);
  return {valid};
}

function buildReport(isTitleValid) {
  const message = isTitleValid ? buildSuccessMessage() : buildErrorMessage();

  return ['## PR Title', message].join('\n\n');
}

function buildSuccessMessage() {
  return `:white_check_mark: Title follows the [conventional commit](${specUrl}) spec.`;
}

function buildErrorMessage() {
  return `:x: Title should follow the [conventional commit](${specUrl}) spec:  
\`<type>(optional scope): <description>\`

Example: \`feat(headless): add result-list controller\``;
}

export async function buildTitleReport() {
  const prTitle = (await getPullRequestTitle()) || '';
  const {valid} = analyze(prTitle);
  const isTitleValid = prTitle && valid;

  return buildReport(isTitleValid);
}
