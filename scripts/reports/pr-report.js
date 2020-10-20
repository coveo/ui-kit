const { buildBundleSizeReport } = require("./bundle-size/bundle-size");
const { buildTitleReport } = require("./title/verify-title");
const { BitbucketClient } = require('./bitbucket-client');


const reportTitle = 'Pull Request Report';

async function main() {
  const report = await buildReport();
  sendReport(report);
}

async function buildReport() {
  const titleFormatReport = await buildTitleReport();
  const bundleSizeReport = await buildBundleSizeReport();

  return `
  **${reportTitle}**

  ${titleFormatReport}

  ${bundleSizeReport}
  `
}

async function sendReport(report) {
  console.log('sending report');
  
  const client = new BitbucketClient();
  const comments = await client.getPullRequestComments();
  const comment = findBundleSizeComment(comments);
  
  comment ? client.updateComment(comment.id, report) : client.createComment(report);
}

function findBundleSizeComment(comments) {
  return comments.find(comment => comment.content.raw.indexOf(reportTitle) !== -1)
}

main();