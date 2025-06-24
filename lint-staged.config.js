module.exports = {
  '**/*.{ts?(x),?(m)js,json,css,html,md,yml}': (files) => {
    const filteredFiles = files.filter(
      (file) =>
        !(file.includes('/stencil-generated/') && file.endsWith('.ts')) &&
        !file.includes('/packages/quantic/') &&
        !file.endsWith('.tw.css') &&
        !file.endsWith('.pcss')
    );
    return `biome check --write ${filteredFiles.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
