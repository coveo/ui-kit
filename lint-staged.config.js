module.exports = {
  '**/*.{ts?(x),?(m)js}': (files) => {
    const filteredFiles = files.filter(
      (file) => !file.includes('/stencil-generated/') || !file.endsWith('.ts')
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
