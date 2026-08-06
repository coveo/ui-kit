import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const [buildNumber] = process.argv.slice(2);
const appId = '6a21d979211635c803fe5006';
const repository = 'coveo/ui-kit';

if (!/^\d+$/.test(buildNumber ?? '')) {
  throw new Error('Usage: node trace-chromatic-build.mjs <build-number>');
}

const chromaticUrl = `https://coveo.chromatic.com/build?appId=${appId}&number=${buildNumber}`;

const gh = async (args) => {
  const {stdout} = await execFileAsync('gh', args, {maxBuffer: 50 * 1024 * 1024});
  return stdout;
};

const diagnosticsFrom = (log) => {
  const diagnostics = [];
  let captureChangedStorybookFiles = false;

  for (const line of log.split('\n')) {
    const message = line.replace(/^.*?Z\s*/, '');
    if (message.includes('Changed Storybook Files')) {
      captureChangedStorybookFiles = true;
      diagnostics.push(message);
      continue;
    }
    if (captureChangedStorybookFiles) {
      if (!message.trim() || message.includes('We detected some untraced')) {
        captureChangedStorybookFiles = false;
      } else {
        diagnostics.push(message);
        continue;
      }
    }
    if (
      /Chromatic CLI|> chromatic|Missing commit detected|couldn't find the commit|copied from the most recent build|Found \d+ changed files|→ Commit '|→ Build \d+ initialized|TurboSnap disabled due to file change|Found a Storybook config change|Skipping build/.test(message)
    ) {
      diagnostics.push(message);
    }
  }

  return diagnostics;
};

const buildPage = await fetch(chromaticUrl, {
  headers: {'user-agent': 'ui-kit-chromatic-trace'},
});

if (!buildPage.ok) {
  throw new Error(`Could not load Chromatic build ${buildNumber}: ${buildPage.status}`);
}

const buildPageHtml = await buildPage.text();
const commitMatch = buildPageHtml.match(
  /https:\/\/github\.com\/coveo\/ui-kit\/commit\/([a-f0-9]{40})/
);

if (!commitMatch) {
  throw new Error(`Could not find a ui-kit commit on Chromatic build ${buildNumber}`);
}

const commit = commitMatch[1];
const [statuses, workflowRuns] = await Promise.all([
  gh(['api', `repos/${repository}/commits/${commit}/status`]).then(JSON.parse),
  gh(['api', `repos/${repository}/actions/runs?head_sha=${commit}&per_page=100`]).then(JSON.parse),
]);

const storybookUrls = statuses.statuses
  .filter(({context, target_url: targetUrl}) => context === 'Storybook Publish' && targetUrl)
  .map(({target_url: targetUrl}) => targetUrl);
const uiTestUrls = statuses.statuses
  .filter(({context, target_url: targetUrl}) => context === 'UI Tests' && targetUrl?.includes(`number=${buildNumber}`))
  .map(({target_url: targetUrl}) => targetUrl);

const candidates = await Promise.all(
  workflowRuns.workflow_runs.map(async (workflowRun) => {
    const jobs = await gh([
      'api',
      `repos/${repository}/actions/runs/${workflowRun.id}/jobs?per_page=100`,
    ]).then(JSON.parse);
    const job = jobs.jobs.find(({name}) => name === 'Run Chromatic visual tests on Atomic');

    if (!job) {
      return null;
    }

    let log = '';
    let logError = null;
    try {
      log = await gh(['run', 'view', String(workflowRun.id), '--job', String(job.id), '--log']);
    } catch (error) {
      logError = error.stderr?.trim() || error.message;
    }

    const diagnostics = diagnosticsFrom(log);
    return {
      event: workflowRun.event,
      runUrl: workflowRun.html_url,
      jobUrl: job.html_url,
      diagnostics,
      logError,
      initializesBuild: diagnostics.some((line) => line.includes(`Build ${buildNumber} initialized`)),
      skipsBuild: diagnostics.some((line) => line.includes('Skipping build')),
    };
  })
);

console.log(JSON.stringify({
  buildNumber: Number(buildNumber),
  chromaticUrl,
  commit,
  commitUrl: `https://github.com/${repository}/commit/${commit}`,
  uiTestUrls,
  storybookUrls,
  chromaticDiagnosticsUrls: storybookUrls.map((url) => new URL('.chromatic/', url).toString()),
  candidates: candidates.filter(Boolean),
}, null, 2));
