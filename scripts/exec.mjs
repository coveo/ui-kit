import {spawn} from 'child_process';

/**
 * @param {string} command
 * @param {readonly string[]} [args]
 * @returns {Promise<string>}
 */
export function execute(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let data = '';
    let error = '';

    console.log(
      '\x1b[35m>\x1b[0m\xa0',
      command,
      ...args
        .map((arg) => arg.replace('"', '\\"'))
        .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
    );

    /**
     * @param {string} str
     */
    function trimNewline(str) {
      return str.endsWith('\n') ? str.slice(0, -1) : str;
    }

    proc.stdout.on('data', (chunk) => {
      console.log(trimNewline(chunk.toString()));
      data += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      const exclamation = '\x1b[31m!\x1b[0m\xa0';
      console.error(
        exclamation,
        trimNewline(chunk.toString()).replace('\n', '\n' + exclamation)
      );
      error += chunk.toString();
    });
    proc.on('exit', (code) =>
      code === 0
        ? resolve(trimNewline(data))
        : reject({code, error: trimNewline(error)})
    );
  });
}
