process.env.TZ = 'Australia/Eucla';

module.exports = {
  preset: 'ts-jest',
  silent: true,
  setupFiles: ['./jest.setup.js'],
};
