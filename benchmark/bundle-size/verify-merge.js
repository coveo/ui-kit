const {BitbucketClient} = require('./bitbucket-client');

console.log(new BitbucketClient().getPullRequestComments());
