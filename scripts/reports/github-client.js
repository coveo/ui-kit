const {Octokit} = require('@octokit/rest');
const credentials =
  process.env.GITHUB_CREDENTIALS || '82ecb83d237039ee70cfbad6d77b2666cd52aed9';

const newClient = () =>
  new Octokit({
    auth: credentials,
  });

module.exports = {newClient};
