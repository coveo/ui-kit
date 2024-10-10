import {publint} from 'publint';

let exitCode = 0;

const pkgDirs = [
  'packages/atomic',
  'packages/headless',
  'packages/atomic-react',
];

const issues = await Promise.all(
  pkgDirs.map(async (pkgDir) => {
    const {messages} = await publint({
      pkgDir,
      level: 'suggestion',
      strict: false,
    });

    const suggestions = [];
    const warnings = [];
    const errors = [];

    for (const message of messages) {
      switch (message.type) {
        case 'suggestion':
          suggestions.push(message);
          break;
        case 'warning':
          warnings.push(message);
          break;
        case 'error':
          errors.push(message);
          break;
      }
    }

    return {
      pkgDir,
      suggestions,
      warnings,
      errors,
    };
  })
);

if (issues.length > 0) {
  console.info('The publint scan detected compatibility issues:\n');

  for (const issue of issues) {
    console.info(`\n********** ${issue.pkgDir} **********\n`);
    if (issue.errors.length > 0) {
      exitCode = 1;
      console.info('Errors:\n');
      console.error(JSON.stringify(issue.errors, null, 2));
    }
    if (issue.warnings.length > 0) {
      console.info('Warnings:\n');
      console.warn(JSON.stringify(issue.warnings, null, 2));
    }
    if (issue.suggestions.length > 0) {
      console.info('Suggestions:\n');
      console.info(JSON.stringify(issue.suggestions, null, 2));
    }
  }
} else {
  console.info('No compatibility issues found by publint.');
}

process.exit(exitCode);
