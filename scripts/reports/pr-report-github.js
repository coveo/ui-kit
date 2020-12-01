const {
  getPullRequestComments,
  updatePullRequestComment,
  createPullRequestComment,
} = require('./github-client');
const {buildTitleReport} = require('./title/verify-title');

const reportTitle = 'Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const bundleSizeReport = ''; // await buildBundleSizeReport();

  return `
  **${reportTitle}**

  ${titleFormatReport}

  ${bundleSizeReport}
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
  return comments.find(
    (comment) => comment.body.indexOf(reportTitle) !== -1
  );
}

main();
