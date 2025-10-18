import {defineConfig} from 'cypress';
import baseConfig from '../cypress.config';

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    specPattern: '../cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
