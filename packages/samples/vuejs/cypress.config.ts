// eslint-disable-next-line node/no-unpublished-import
import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
