module.exports = {
  '**/*.{ts?(x),?(m)js}': (files) => {
    const filteredFiles = files.filter((file) => {
      // Exclude .vscode directory
      if (file.includes('/.vscode/')) return false;

      // Exclude quantic and create-atomic-template packages
      if (file.includes('/packages/quantic/')) return false;
      if (file.includes('/packages/create-atomic-template/')) return false;
      if (file.includes('/packages/create-atomic-component/template/'))
        return false;
      if (file.includes('/packages/create-atomic-component-project/template/'))
        return false;

      // Exclude root deployment config
      if (file.includes('/.deployment.config/')) return false;

      // Exclude atomic package d.ts files
      if (file.includes('/packages/atomic/') && file.endsWith('.d.ts'))
        return false;

      // Exclude documentation assets
      if (
        file.includes('/packages/documentation/') &&
        file.includes('/assets/')
      )
        return false;

      // Exclude headless coveo.analytics
      if (
        file.includes('/packages/headless/') &&
        file.includes('/coveo.analytics/')
      )
        return false;

      return true;
    });
    if (filteredFiles.length === 0) {
      return 'echo "No files to lint"';
    }
    return [
      `oxlint --fix ${filteredFiles.join(' ')}`,
      `oxfmt ${filteredFiles.join(' ')}`,
    ];
  },
  '**/*.{json,css,html}': (files) => {
    const filteredFiles = files.filter((file) => {
      if (file.includes('/.vscode/')) return false;
      if (file.includes('/packages/quantic/')) return false;
      if (file.includes('/.deployment.config/')) return false;
      if (file.endsWith('package-lock.json')) return false;
      if (file.includes('/.storybook/') && file.endsWith('.html')) return false;
      return true;
    });
    if (filteredFiles.length === 0) {
      return 'echo "No files to format"';
    }
    return `oxfmt ${filteredFiles.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
