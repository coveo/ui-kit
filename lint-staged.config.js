module.exports = {
  '**/*.{ts?(x),?(m)js,json,css,html}': (files) => {
    const filteredFiles = files.filter((file) => {
      // Exclude quantic and create-atomic-template packages
      if (file.includes('/packages/quantic/')) return false;
      if (file.includes('/packages/create-atomic-template/')) return false;
      if (file.includes('/packages/create-atomic-component/template/'))
        return false;
      if (file.includes('/packages/create-atomic-component-project/template/'))
        return false;

      // Exclude root deployment config
      if (file.includes('/.deployment.config/')) return false;

      if (file.endsWith('package-lock.json')) return false;

      // Exclude atomic package cypress, tsx (except stories), and d.ts files
      if (
        file.includes('/packages/atomic/') &&
        (file.includes('/cypress/') ||
          (file.endsWith('.tsx') && !file.endsWith('.stories.tsx')) ||
          file.endsWith('.d.ts'))
      )
        return false;

      // Exclude atomic-angular stencil-generated
      if (
        file.includes('/packages/atomic-angular/') &&
        file.includes('/stencil-generated/')
      )
        return false;

      // Exclude atomic-react stencil-generated
      if (
        file.includes('/packages/atomic-react/') &&
        file.includes('/stencil-generated/')
      )
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

      // Exclude atomic-stencil-samples d.ts
      if (file.includes('/packages/samples/stencil/') && file.endsWith('.d.ts'))
        return false;

      // Exclude tailwind css files
      if (file.endsWith('.css')) return false;

      return true;
    });
    if (filteredFiles.length === 0) {
      return 'echo "No files to process with Biome"';
    }
    return `biome check --write --error-on-warnings ${filteredFiles.join(' ')}`;
  },
  '**/*.md': (files) => {
    return `cspell --no-progress --show-suggestions --show-context --no-must-find-files ${files.join(
      ' '
    )}`;
  },
};
