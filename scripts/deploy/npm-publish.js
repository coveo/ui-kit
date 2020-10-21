const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

function publish() {
  const [node,file, ...args] = process.argv;
  const params = args.length ? `-- -- ${args.join(' ')}` : '';
  
  return exec(`lerna run --no-bail npm:publish ${params}`)
}

async function main() {
  try {
    await publish();
  } catch(e) {
    console.error(e);
  }
}

main();