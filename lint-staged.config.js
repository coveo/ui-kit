const {ESLint} = require('eslint');

// Eslint warns if ignored files are linted which causes failure with `--max-warnings=0`
// source: https://stackoverflow.com/a/73818629
// eslint-disable-next-line no-unused-vars
const removeEslintIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const ignoredFiles = await Promise.all(
    files.map((file) => eslint.isPathIgnored(file))
  );
  const filesToLint = files.filter((_, i) => !ignoredFiles[i]);
  console.log(files, ignoredFiles, filesToLint);
  return filesToLint;
};

module.exports = {
  '**/*.{ts?(x),?(m)js}': (files) => {
    // TODO(Debug): [KIT-2673] Filter out eslint ignored files in lint-staged
    // const filteredFiles = removeEslintIgnoredFiles(files).filter(
    const filteredFiles = files.filter(
      (file) => !(file.includes('/stencil-generated/') && file.endsWith('.ts'))
    );
    return `eslint --fix --max-warnings=0 ${filteredFiles.join(' ')}`;
  },
  '**/{*.{scss,css,pcss,html,md},{package,nx,project}.json}': (files) => {
    return `prettier --write ${files.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
