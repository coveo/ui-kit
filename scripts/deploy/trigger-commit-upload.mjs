// Dispatches the `deploy-commit` event that tells coveo-platform/ui-kit-cd to
// build and upload CDN artifacts for a ui-kit commit.
//
// This dispatch is the ONLY signal ui-kit-cd receives. If it never fires, npm
// ends up ahead of the CDN and the published version's folder returns 403
// forever, because a later release only ever writes its own version folders.
// Treat a failure here as a release incident, not a flake.
//
// Environment:
//   GH_TOKEN  (required) token able to dispatch to coveo-platform/ui-kit-cd
//   CHANNELS  (required) comma-separated pointer channels: private | private,preview | hotfix
//   SHA       (optional) ui-kit commit to deploy. Defaults to the SHA of the
//             running workflow. `redeploy-cdn.yml` sets this explicitly because
//             a workflow_dispatch run reports the default branch's SHA in
//             `context.sha`, not the SHA of the ref it checked out.
import {context, getOctokit} from '@actions/github';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

const octokit = getOctokit(process.env.GH_TOKEN);
const channels = process.env.CHANNELS;
const sha = process.env.SHA || context.sha;

if (!channels) {
  throw new Error('CHANNELS is required (private | private,preview | hotfix)');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A transient failure here is indistinguishable from a CDN deployment that was
// never requested, so retry rather than let one bad response create a gap.
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    await octokit.rest.repos.createDispatchEvent({
      event_type: 'deploy-commit',
      client_payload: {
        run_id: context.runId,
        sha,
        channels,
      },
      owner: 'coveo-platform',
      repo: 'ui-kit-cd',
    });
    console.log(`Dispatched deploy-commit for ${sha} (channels: ${channels})`);
    break;
  } catch (error) {
    if (attempt === MAX_ATTEMPTS) {
      throw error;
    }
    console.warn(
      `Dispatch attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}. Retrying in ${RETRY_DELAY_MS}ms.`
    );
    await sleep(RETRY_DELAY_MS);
  }
}
