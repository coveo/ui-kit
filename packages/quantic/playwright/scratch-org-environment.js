const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

const scratchOrgConfigurations = [
  {
    environmentFile: 'Quantic__LWS_enabled.env',
    environmentVariable: 'Quantic__LWS_enabled_URL',
    resultKey: 'lwsEnabledUrl',
  },
  {
    environmentFile: 'Quantic__LWS_disabled.env',
    environmentVariable: 'Quantic__LWS_disabled_URL',
    resultKey: 'lwsDisabledUrl',
  },
];

function loadScratchOrgEnvironment(projectDirectory) {
  return Object.fromEntries(
    scratchOrgConfigurations.map((configuration) => [
      configuration.resultKey,
      loadScratchOrgUrl(projectDirectory, configuration),
    ])
  );
}

function loadScratchOrgUrl(projectDirectory, configuration) {
  const environmentFilePath = path.join(
    projectDirectory,
    '.env',
    configuration.environmentFile
  );
  let environment;

  try {
    environment = dotenv.parse(fs.readFileSync(environmentFilePath, 'utf8'));
  } catch (error) {
    const reason = error?.code === 'ENOENT' ? 'is missing' : 'cannot be read';
    throw new Error(
      `Cannot run Quantic Playwright tests because .env/${configuration.environmentFile} ${reason}. Run "pnpm run setup:examples" to create the Quantic scratch-org communities.`
    );
  }

  const url = environment[configuration.environmentVariable]?.trim();
  if (!url || !isHttpsUrl(url)) {
    throw new Error(
      `Cannot run Quantic Playwright tests because .env/${configuration.environmentFile} must define ${configuration.environmentVariable} with an HTTPS URL. Run "pnpm run setup:examples" to create the Quantic scratch-org communities.`
    );
  }

  return url;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {loadScratchOrgEnvironment};
