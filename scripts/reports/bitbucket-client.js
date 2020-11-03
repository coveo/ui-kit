const { fetch } = require('cross-fetch');

const credentials = process.env.BITBUCKET_CREDENTIALS || '';
const pullRequestId = process.env.BITBUCKET_PULL_REQUEST_ID || '';
class BitbucketClient {
  async getPullRequestComments() {
    const res = await fetch(this.commentsUrl);
    const { values } = await res.json();
    return values;
  }

  async createComment(text) {
    const comment = this.buildComment(text);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    };
    
    await fetch(this.commentsUrl, options);
  }

  async updateComment(id, text) {
    const comment = this.buildComment(text);
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    }

    await fetch(`${this.commentsUrl}/${id}`, options);
  }

  buildComment(text) {
    return {
      content: { raw: text }
    }
  }
  
  get commentsUrl() {
    return `${this.api}/2.0/repositories/coveord/ui-kit/pullrequests/${pullRequestId}/comments`;
  }

  get api() {
    return `https://${credentials}@api.bitbucket.org`;
  }
}

module.exports = { BitbucketClient }
