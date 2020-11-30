const {Octokit} = require('@octokit/rest');
const credentials = process.env.GITHUB_CREDENTIALS || '';

export const newClient = () =>
  new Octokit({
    auth: credentials,
  });
