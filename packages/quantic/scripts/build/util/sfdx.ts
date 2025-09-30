import {exec} from 'child_process';

function stripColor(str: string) {
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
}

/**
 * A response from a successful sfdx command.
 */
export interface SfdxResponse {
  status: number;
  result: object;
}

/**
 * Executes the given sfdx function and returns the result as an object.
 * @param command The command to be executed.
 * @returns {SfdxResponse} The result of the command, if successful.
 * @throws {Error} The error thrown by the sfdx command if unsuccessful.
 */
export function sfdx<T = SfdxResponse>(command: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    exec(
      `sf ${command} --json`,
      {
        cwd: process.cwd(),
        env: process.env,
        maxBuffer: 1024 * 1024 * 1.5,
      },
      (error, stdout) => {
        let jsonOutput: unknown;
        if (error) {
          console.log('Error with sfdx command execution.');
          console.error(error);
        }
        if (stdout) {
          try {
            jsonOutput = JSON.parse(stripColor(stdout));
            if (error) {
              console.error({
                sfdxErrorStdout: stdout,
              });
              reject(jsonOutput || error);
            }
            resolve(jsonOutput as T);
          } catch (err) {
            // The output is not JSON. The command most likely failed outside the SFDX CLI.
            console.log(stdout);
            reject(err);
          }
        }
      }
    );
  });
}
