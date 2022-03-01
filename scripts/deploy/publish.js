const {resolve} = require('path');
const {readFileSync} = require('fs');
const {execSync, spawnSync} = require('child_process');

const [tag] = process.argv.slice(2);

const pathToPackageJSON = resolve(process.cwd(), './package.json');
/** @type {{ name: string, version: string }} */
const pkg = JSON.parse(readFileSync(pathToPackageJSON));
const packageRef = `${pkg.name}@${pkg.version}`;

function shouldPublish() {
  try {
    const packageVersionNotPublished = !execSync(`npm view ${packageRef}`).toString().length;
    return packageVersionNotPublished;
  } catch (e) {
    const isFirstPublish = e.toString().includes('code E404');
    return isFirstPublish;
  }
}

function publish() {
  const params = ['publish', '--verbose', '--access', 'public'];
  if (tag) {
    params.push('--tag', tag);
  }
  spawnSync('npm', params, {
    stdio: 'inherit',
  });
}

if (shouldPublish()) {
  publish();
} else {
  console.info(
    `Skipped publishing ${packageRef} (${
      tag || 'latest'
    }) since it's already published.`
  );
}
