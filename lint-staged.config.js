module.exports = {
  '**/*.{ts?(x),?(m)js}': (files) => {
    const filteredFiles = files.filter(
      (file) => !(file.includes('/stencil-generated/') && file.endsWith('.ts'))
    );
    return [
      `npx oxlint --fix ${filteredFiles.join(' ')}`,
      `eslint --fix ${filteredFiles.join(' ')}`,
    ];
  },
  '**/*.{scss,css,pcss,html,md,yml,ts,tsx,js,mjs,json}': (files) => {
    return `prettier --write ${files.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
