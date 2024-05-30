import {context} from '@actions/github';

export const buildLiveExampleReport = async () => `
* [Storybook](https://coveo.github.io/ui-kit-prs/${context.event.payload.pull_request.number}/dist-storybook/)`;
