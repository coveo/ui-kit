module.exports = {
  '**/*.{ts?(x),?(m)js,json,css,html,md,yml}': (files) => {
    const filteredFiles = files.filter(
      (file) =>
        !(file.includes('/stencil-generated/') && file.endsWith('.ts')) &&
        !file.includes('/packages/quantic/') &&
        !file.includes('.github/prompts') &&
        !file.includes('.github/instructions') &&
        !file.endsWith('.tw.css') &&
        !file.endsWith('.pcss') &&
        !file.endsWith('/package.json') &&
        !file.endsWith('/package-lock.json')
    );
    if (filteredFiles.length === 0) {
      return 'echo "No files to process with Biome"';
    }
    return `biome check --write ${filteredFiles.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
