import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates and retrieves the scratch org definition file path from arguments.
 * @param {string[]} args - Command-line arguments.
 * @returns {string} - The resolved path to the scratch org definition file.
 * @throws {Error} - If the argument is missing or empty, or if the file doesn't exist.
 */
export function getScratchOrgDefPath(args) {
  const scratchOrgDefArg = args.find((arg) =>
    arg.startsWith('--scratch-org-def-path=')
  );

  if (!scratchOrgDefArg) {
    throw new Error(
      'Error: The "--scratch-org-def-path" argument is required.'
    );
  }

  const scratchOrgDefPath = scratchOrgDefArg.split('=')[1]?.trim();

  if (!scratchOrgDefPath) {
    throw new Error(
      'Error: The "--scratch-org-def-path" argument cannot be empty.'
    );
  }

  const resolvedPath = path.resolve(scratchOrgDefPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Error: The file at "${resolvedPath}" does not exist. Please provide a valid path.`
    );
  }

  return resolvedPath;
}

/**
 * Reads the orgName from a scratch org definition JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {string} - The orgName value.
 * @throws If the file doesn't exist or is invalid.
 */
export function getOrgNameFromScratchDefFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    if (!jsonData.orgName) {
      throw new Error("The 'orgName' field is missing in the definition file.");
    }
    return jsonData.orgName;
  } catch (error) {
    throw new Error(`Failed to read orgName: ${error.message}`);
  }
}

