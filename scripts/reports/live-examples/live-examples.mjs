import {context} from '@actions/github';

export const buildLiveExampleReport = async () =>
  [
    '## Live demo links',
    `* [Storybook](https://coveo.github.io/ui-kit-prs/${context.payload.pull_request.number}/dist-storybook/)`,
    `* [Playwright report](https://coveo.github.io/ui-kit-prs/${context.payload.pull_request.number}/playwright-report/)`,
  ].join('\n\n');
