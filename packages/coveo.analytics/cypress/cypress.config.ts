import {defineConfig} from 'cypress';

export default defineConfig({
    e2e: {
        fileServerFolder: 'tests',
        specPattern: '**/*.spec.ts',
        fixturesFolder: false,
        supportFile: 'support/index.ts',
        video: false,
        screenshotsFolder: 'screenshots',
        reporter: 'junit',
        reporterOptions: {
            mochaFile: 'reports/junit-[hash].xml',
        },
        viewportWidth: 1366,
        viewportHeight: 768,
        retries: {
            runMode: 2,
        },
    },
});
