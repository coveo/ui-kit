const {newClient} = require('./github-client');

async function main() {
  const c = newClient();
  console.log(c);
}

main();
