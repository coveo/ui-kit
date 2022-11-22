import {Buffer} from 'buffer';
import {spawn} from 'child_process';

/**
 * @param {string} str
 */
function trimNewline(str) {
  return str.endsWith('\n') ? str.slice(0, -1) : str;
}

/**
 * @param {string} command
 * @param {readonly string[]} [args]
 * @returns {Promise<string>}
 */
export function execute(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    /** @type {Uint8Array} */
    let dataChunks = [];
    /** @type {Uint8Array} */
    let errorChunks = [];

    console.log(
      '\x1b[35m>\x1b[0m\xa0',
      command,
      ...args
        .map((arg) => arg.replace(/"/g, '\\"').replace(/\n/g, '\\n'))
        .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
    );

    proc.stdout.on('data', (chunk) => {
      console.log(trimNewline(chunk.toString()));
      dataChunks.push(Buffer.from(chunk));
    });
    proc.stderr.on('data', (chunk) => {
      const exclamation = '\x1b[31m!\x1b[0m\xa0';
      console.error(
        exclamation,
        trimNewline(chunk.toString()).replace('\n', '\n' + exclamation)
      );
      errorChunks.push(Buffer.from(chunk));
    });
    proc.on('exit', (code) =>
      code === 0
        ? resolve(trimNewline(Buffer.concat(dataChunks).toString('utf8')))
        : reject(
            JSON.stringify({
              code,
              error: trimNewline(Buffer.concat(errorChunks).toString('utf8')),
            })
          )
    );
  });
}
