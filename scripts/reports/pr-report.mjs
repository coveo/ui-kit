import {buildBundleSizeReport} from './bundle-size/bundle-size.mjs';
import {
  createPullRequestComment,
  getPullRequestComments,
  updatePullRequestComment,
} from './github-client.mjs';
import {buildLiveExampleReport} from './live-examples/live-examples.mjs';
import {buildTitleReport} from './title/verify-title.mjs';

const reportCommentIdentifier = '<!-- pr-report -->';

const reportTitle = '# Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const liveExamplesReport = await buildLiveExampleReport();
  const bundleSizeReport = await buildBundleSizeReport();

  return [
    reportTitle,
    titleFormatReport,
    liveExamplesReport,
    bundleSizeReport,
    reportCommentIdentifier,
  ].join('\n\n');
}

async function sendReport(report) {
  console.log('sending report');
  const comments = await getPullRequestComments();
  const comment = findBundleSizeComment(comments.data);

  comment
    ? updatePullRequestComment(comment.id, report)
    : createPullRequestComment(report);
}
''.en;
function findBundleSizeComment(comments) {
  return comments.find((comment) =>
    comment.body.endsWith(reportCommentIdentifier)
  );
}

main();
