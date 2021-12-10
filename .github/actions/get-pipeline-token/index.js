const {setOutput, setSecret} = require('@actions/core');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

/**
 * @param {(...args: Args) => ReturnType} func
 * @param {string | Error} newError
 * @returns {(...args: Args) => ReturnType}
 * @template Args, ReturnType
 */
function replaceErrorMessage(func, newError) {
  return (...args) => {
    try {
      return func(...args);
    } catch (e) {
      throw newError;
    }
  };
}

const safelyParseJSON = replaceErrorMessage(
  JSON.parse,
  'Failed to parse JSON. Details hidden to avoid leaking secrets.'
);

const client = new SecretsManagerClient({region: 'us-east-1'});
const res = await client.send(
  new GetSecretValueCommand({
    SecretId:
      'arn:aws:secretsmanager:us-east-1:458176070654:secret:deployment_pipeline_tokens_dev-Iv6AOi',
  })
);
const token = safelyParseJSON(res.SecretString).jenkins;
setSecret(token);
setOutput('token', token);
