import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GH_TOKEN);

await octokit.rest.repos.createDispatchEvent({
  event_type: 'deploy-dev',
  client_payload: {
    run_Id: context.runId,
    sha: context.sha,
    patch_only: 'true',
    pr_number: context.payload.pull_request?.number,
  },
  owner: 'coveo-platform',
  repo: 'ui-kit-cd',
});
