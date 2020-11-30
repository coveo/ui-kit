const {newClient} = require('./github-client');

async function main() {
  const c = newClient();
  const issues = await c.issues.listForRepo({repo : 'ui-kit', owner: 'coveo', state: 'open'})
  console.log(issues)
}

main();
