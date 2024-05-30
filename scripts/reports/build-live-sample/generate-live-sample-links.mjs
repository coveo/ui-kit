import {context} from '@actions/github';

export const buildLiveExampleReport = async () => `
* [Storybook](https://coveo.github.io/ui-kit-prs/${context.payload.pull_request.number}/dist-storybook/)`;
1;
