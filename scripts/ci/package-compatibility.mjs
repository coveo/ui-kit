import {EOL} from 'node:os';
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

function prettyPrintJSON(label, jsonObject, logFunction) {
  logFunction(`${label}:`, EOL);
  logFunction(JSON.stringify(jsonObject, null, 2), EOL);
}

if (issues.length > 0) {
  console.info('The publint scan detected compatibility issues:\n');

  for (const {errors, warnings, suggestions, pkgDir} of issues) {
    console.group(`\n********** ${pkgDir} **********\n`);
    if (errors.length > 0) {
      exitCode = 1;
      prettyPrintJSON('Errors', errors, console.error);
    }
    if (warnings.length > 0) {
      prettyPrintJSON('Warnings', warnings, console.warn);
    }
    if (suggestions.length > 0) {
      prettyPrintJSON('Suggestions', suggestions, console.info);
    }
    console.groupEnd();
  }
} else {
  console.info('No compatibility issues found by publint.');
}

process.exit(exitCode);
