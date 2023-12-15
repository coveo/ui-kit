import {buildBundleSizeReport} from './bundle-size/bundle-size.mjs';
import {
  getPullRequestComments,
  updatePullRequestComment,
  createPullRequestComment,
} from './github-client.mjs';
import {buildTitleReport} from './title/verify-title.mjs';

const reportTitle = 'Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const bundleSizeReport = await buildBundleSizeReport();
  const ssrProgress = 'SSR Progress: 0%';

  return `
  **${reportTitle}**

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
