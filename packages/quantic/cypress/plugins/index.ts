import * as fs from 'fs';
import * as path from 'path';

interface CommunityConfig {
  baseUrl?: string;
  env?: {
    examplesUrl?: string;
  };
}

async function getCommunityConfigFile(): Promise<CommunityConfig> {
  const pathToConfigFile = path.resolve(
    'cypress',
    'plugins',
    'config',
    'examples-community.json'
  );

  return new Promise((resolve, reject) => {
    fs.readFile(pathToConfigFile, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(data.toString()));
      }
    });
  });
}

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async () => {
  const baseConfig = await getCommunityConfigFile();

  const config = JSON.parse(JSON.stringify(baseConfig)) as CommunityConfig;
  if (!baseConfig.baseUrl && baseConfig?.env?.examplesUrl) {
    config.baseUrl = baseConfig?.env?.examplesUrl;
  }

  return config;
};
