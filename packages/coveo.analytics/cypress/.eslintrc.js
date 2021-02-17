module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [require.resolve('tsjs/eslint-config'), 'plugin:cypress/recommended'],
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    rules: {
        'cypress/no-unnecessary-waiting': 0,
    },
};
