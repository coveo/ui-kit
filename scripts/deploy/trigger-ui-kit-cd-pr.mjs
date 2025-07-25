import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GH_TOKEN);

await octokit.rest.repos.createDispatchEvent({
  event_type: 'deploy-dev',
  client_payload: {
    run_Id: context.runId,
    patch_only: 'true',
  },
  owner: 'coveo-platform',
  repo: 'ui-kit-cd',
});
