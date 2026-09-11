import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

interface ScratchOrgConfiguration {
  environmentFile: string;
  environmentVariable: string;
}

interface ScratchOrgEnvironment {
  lwsEnabledUrl: string;
  lwsDisabledUrl: string;
}

const lwsEnabledConfiguration: ScratchOrgConfiguration = {
  environmentFile: 'Quantic__LWS_enabled.env',
  environmentVariable: 'Quantic__LWS_enabled_URL',
};

const lwsDisabledConfiguration: ScratchOrgConfiguration = {
  environmentFile: 'Quantic__LWS_disabled.env',
  environmentVariable: 'Quantic__LWS_disabled_URL',
};

export function loadScratchOrgEnvironment(
  projectDirectory: string
): ScratchOrgEnvironment {
  return {
    lwsEnabledUrl: loadScratchOrgUrl(projectDirectory, lwsEnabledConfiguration),
    lwsDisabledUrl: loadScratchOrgUrl(
      projectDirectory,
      lwsDisabledConfiguration
    ),
  };
}

function loadScratchOrgUrl(
  projectDirectory: string,
  configuration: ScratchOrgConfiguration
): string {
  const {environmentFile, environmentVariable} = configuration;
  const environmentFilePath = path.join(
    projectDirectory,
    '.env',
    environmentFile
  );
  let environmentFileContents: string;

  try {
    environmentFileContents = fs.readFileSync(environmentFilePath, 'utf8');
  } catch (error) {
    const reason =
      (error as NodeJS.ErrnoException).code === 'ENOENT'
        ? 'is missing'
        : 'cannot be read';
    throw new Error(
      `Cannot run Quantic Playwright tests because .env/${environmentFile} ${reason}. Run "pnpm run setup:examples" to create the Quantic scratch-org communities.`
    );
  }

  const environment = dotenv.parse(environmentFileContents);
  const url = environment[environmentVariable]?.trim();
  if (!url) {
    throw new Error(
      `Cannot run Quantic Playwright tests because .env/${environmentFile} must define ${environmentVariable} with an URL. Run "pnpm run setup:examples" to create the Quantic scratch-org communities.`
    );
  }

  return url;
}
