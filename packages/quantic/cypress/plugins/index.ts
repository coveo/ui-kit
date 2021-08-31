import * as fs from 'fs';
import * as path from 'path';

const getCommunityConfigFile = () => {
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
};

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async () => {
  return await getCommunityConfigFile();
};
