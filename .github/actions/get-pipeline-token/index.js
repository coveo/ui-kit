const {setOutput, setSecret} = require('@actions/core');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({region: 'us-east-1'});
const res = await client.send(
  new GetSecretValueCommand({
    SecretId:
      'arn:aws:secretsmanager:us-east-1:458176070654:secret:deployment_pipeline_tokens_dev-Iv6AOi',
  })
);
const token = JSON.parse(res.SecretString).jenkins;
setSecret(token);
setOutput('token', token);
