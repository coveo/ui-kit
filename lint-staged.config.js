module.exports = {
  '**/*.{ts?(x),?(m)js,json,css,pcss,html,md,yml}': (files) => {
    const filteredFiles = files.filter(
      (file) =>
        !(file.includes('/stencil-generated/') && file.endsWith('.ts')) &&
        !file.includes('/packages/quantic/')
    );
    return `biome check --write ${filteredFiles.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
