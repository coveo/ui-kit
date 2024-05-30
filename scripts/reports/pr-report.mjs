import {buildLiveExampleReport} from './build-live-sample/generate-live-sample-links.mjs';
import {buildBundleSizeReport} from './bundle-size/bundle-size.mjs';
import {
  getPullRequestComments,
  updatePullRequestComment,
  createPullRequestComment,
} from './github-client.mjs';
import {buildSSRProgressReport} from './ssr-progress/ssr-progress.mjs';
import {buildTitleReport} from './title/verify-title.mjs';

const reportTitle = 'Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const liveExample = await buildLiveExampleReport();
  const ssrProgress = await buildSSRProgressReport();
  const bundleSizeReport = await buildBundleSizeReport();

  return `
  **${reportTitle}**

  ${liveExample}

  ${titleFormatReport}

  ${bundleSizeReport}

  ${ssrProgress}
  `;
}

async function sendReport(report) {
  console.log('sending report');
  const comments = await getPullRequestComments();
  const comment = findBundleSizeComment(comments.data);

  comment
    ? updatePullRequestComment(comment.id, report)
    : createPullRequestComment(report);
}

function findBundleSizeComment(comments) {
  return comments.find((comment) => comment.body.indexOf(reportTitle) !== -1);
}

main();
