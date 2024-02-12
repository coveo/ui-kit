// eslint-disable-next-line node/no-unpublished-import
import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(_on, _config) {
    },
  },
});
