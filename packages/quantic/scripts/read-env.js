const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const core = require('@actions/core');

const envFilePath = path.resolve(__dirname, '../../quantic/.env');
dotenv.config({path: envFilePath});

const envVariables = dotenv.parse(fs.readFileSync(envFilePath));

for (const key in envVariables) {
  // eslint-disable-next-line no-prototype-builtins
  if (envVariables.hasOwnProperty(key)) {
    console.log(`${key}=${envVariables[key]}`);
    if (key === 'Quantic__LWS_disabled_URL') {
      core.setOutput('Quantic__LWS_disabled_URL', envVariables[key]);
    }
  }
}
