import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GH_TOKEN);
const channels = process.env.CHANNELS;

await octokit.rest.repos.createDispatchEvent({
  event_type: 'deploy-commit',
  client_payload: {
    run_id: context.runId,
    sha: context.sha,
    channels,
  },
  owner: 'coveo-platform',
  repo: 'ui-kit-cd',
});
