import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GH_TOKEN);

await octokit.rest.repos.createDispatchEvent({
  event_type: 'deploy-commit',
  client_payload: {
    run_id: context.runId,
    sha: context.sha,
  },
  owner: 'coveo-platform',
  repo: 'ui-kit-cd',
});
