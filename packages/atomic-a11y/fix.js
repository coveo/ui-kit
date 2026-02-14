const fs = require('fs');
const file = 'src/reporter/vitest-a11y-reporter.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add extractCriteriaFromTags to axe-integration import
if (!content.includes('extractCriteriaFromTags')) {
  content = content.replace(
    /(\} from '\.\/axe-integration\.js';)/,
    `  extractCriteriaFromTags,\n$1`
  );
}

// 2. Add stripAnsiSequences to reporter-utils import  
if (!content.includes('stripAnsiSequences')) {
  content = content.replace(
    /(\} from '\.\/reporter-utils\.js';)/,
    `  stripAnsiSequences,\n$1`
  );
}

// 3. Update testUtils export
content = content.replace(
  /export const vitestA11yReporterTestUtils = \{[^}]+\};/,
  `export const vitestA11yReporterTestUtils = {
  extractCategory,
  extractComponentName,
  extractFramework,
  formatDate,
  getAutomationCoveragePercentage,
  getCriteriaForRule,
  extractCriteriaFromTags,
  stripAnsiSequences,
};`
);

fs.writeFileSync(file, content);
console.log('Fixed');
