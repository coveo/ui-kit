import {Buffer} from 'node:buffer';
import {spawn} from 'node:child_process';

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
    /** @type {Buffer} */
    let dataBuffer = Buffer.alloc(0);
    /** @type {Buffer} */
    let errorBuffer = Buffer.alloc(0);

    console.log(
      '\x1b[35m>\x1b[0m\xa0',
      command,
      ...args
        .map((arg) => arg.replace(/"/g, '\\"').replace(/\n/g, '\\n'))
        .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
    );

    proc.stdout.on('data', (chunk) => {
      console.log(trimNewline(chunk.toString()));
      dataBuffer = Buffer.concat([dataBuffer, chunk]);
    });
    proc.stderr.on('data', (chunk) => {
      const exclamation = '\x1b[31m!\x1b[0m\xa0';
      console.error(
        exclamation,
        trimNewline(chunk.toString()).replace(/\n/g, `\n${exclamation}`)
      );
      errorBuffer = Buffer.concat([errorBuffer, chunk]);
    });
    proc.on('exit', (code) =>
      code === 0
        ? resolve(trimNewline(dataBuffer.toString('utf8')))
        : reject({
            code,
            error: trimNewline(errorBuffer.toString('utf8')),
          })
    );
  });
}
