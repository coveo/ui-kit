const lint = require('@commitlint/lint');
const conventialConfig = require('@commitlint/config-conventional');
const lernaConfig = require('@commitlint/config-lerna-scopes');

console.log(conventialConfig.rules);

const getLernaPackages = async () => {
  return await lernaConfig.rules['scope-enum']();
};

const doLint = async () => {
  const packages = await getLernaPackages();
  lint
    .default(
      `
    chore: qwww
    www
    `,
      {
        ...conventialConfig.rules,
        'scope-enum': packages,
      }
    )
    .then((report) => console.log(report));
};

doLint();

//console.log()
