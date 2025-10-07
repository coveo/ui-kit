import {createVitest} from 'vitest/node';

await createVitest('test', {
  root: '/Users/lbompart/Repos/coveo/ui-kit',
  config: '/Users/lbompart/Repos/coveo/ui-kit/vitest.config.js',
  watch: true,
  passWithNoTests: false,
  project: ['atomic-storybook'],
  reporters: ['default'],
  coverage: {enabled: false},
});
