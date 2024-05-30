import {buildBundleSizeReport} from './bundle-size/bundle-size.mjs';
import {
  getPullRequestComments,
  updatePullRequestComment,
  createPullRequestComment,
} from './github-client.mjs';
import {buildSSRProgressReport} from './ssr-progress/ssr-progress.mjs';
import {buildTitleReport} from './title/verify-title.mjs';

const reportTitle = '# Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const bundleSizeReport = await buildBundleSizeReport();
  const ssrProgress = await buildSSRProgressReport();

  return [reportTitle, titleFormatReport, bundleSizeReport, ssrProgress].join(
    '\n\n'
  );
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
