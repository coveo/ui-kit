#!/usr/bin/env node

/**
 * pnpm Migration Helper Script
 * 
 * This script helps automate some of the repetitive find/replace operations
 * needed for the npm to pnpm migration.
 * 
 * Usage:
 *   node .github/instructions/pnpm-migration-helper.mjs --dry-run
 *   node .github/instructions/pnpm-migration-helper.mjs --apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { relative } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const APPLY = process.argv.includes('--apply');

if (!DRY_RUN && !APPLY) {
  console.log('Usage:');
  console.log('  --dry-run    Show what would be changed without making changes');
  console.log('  --apply      Apply the changes');
  process.exit(1);
}

console.log(`Running in ${DRY_RUN ? 'DRY RUN' : 'APPLY'} mode\n`);

// Patterns to replace (order matters!)
const replacements = [
  {
    name: 'npm run-script -w= to pnpm --filter',
    pattern: /npm run-script -w=(\S+)/g,
    replacement: 'pnpm --filter $1',
    filePatterns: ['**/package.json'],
  },
  {
    name: 'npm run -w to pnpm --filter',
    pattern: /npm run -w (\S+)/g,
    replacement: 'pnpm --filter $1',
    filePatterns: ['**/package.json'],
  },
  {
    name: 'npm run to pnpm run (in scripts)',
    pattern: /"npm run /g,
    replacement: '"pnpm run ',
    filePatterns: ['**/package.json'],
  },
  {
    name: 'npm ci to pnpm install --frozen-lockfile',
    pattern: /npm ci\b/g,
    replacement: 'pnpm install --frozen-lockfile',
    filePatterns: ['**/*.{yml,yaml,sh,md}'],
  },
  {
    name: 'npm install to pnpm install (in markdown)',
    pattern: /npm install\b/g,
    replacement: 'pnpm install',
    filePatterns: ['**/*.md'],
  },
  {
    name: 'npm i to pnpm install (in markdown)',
    pattern: /npm i\b/g,
    replacement: 'pnpm install',
    filePatterns: ['**/*.md'],
  },
  {
    name: 'npm run <script> to pnpm run <script> (in markdown)',
    pattern: /npm run (\S+)/g,
    replacement: 'pnpm run $1',
    filePatterns: ['**/*.md'],
  },
  {
    name: 'package-lock.json to pnpm-lock.yaml',
    pattern: /package-lock\.json/g,
    replacement: 'pnpm-lock.yaml',
    filePatterns: ['**/*.{js,mjs,cjs,ts,json,yml,yaml,md}', '!**/node_modules/**'],
  },
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/dist-storybook/**',
  '**/.next/**',
  '**/coverage/**',
  '**/playwright-report/**',
  '**/*.tsbuildinfo',
];

async function processFiles() {
  let totalChanges = 0;
  const changedFiles = new Set();

  for (const { name, pattern, replacement, filePatterns } of replacements) {
    console.log(`\nProcessing: ${name}`);
    
    const files = await glob(filePatterns, {
      ignore: excludePatterns,
      nodir: true,
    });

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf8');
        const newContent = content.replace(pattern, replacement);

        if (content !== newContent) {
          const matches = (content.match(pattern) || []).length;
          console.log(`  ✓ ${relative(process.cwd(), file)}: ${matches} replacement(s)`);
          
          if (APPLY) {
            writeFileSync(file, newContent, 'utf8');
          }
          
          changedFiles.add(file);
          totalChanges += matches;
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total files affected: ${changedFiles.size}`);
  console.log(`Total replacements: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\nThis was a DRY RUN. No files were modified.');
    console.log('Run with --apply to make these changes.');
  } else {
    console.log('\nChanges have been applied!');
    console.log('\nNext steps:');
    console.log('1. Review changes with: git diff');
    console.log('2. Test the changes: pnpm install && pnpm run build');
    console.log('3. Commit if everything works: git add -A && git commit -m "chore: migrate scripts to pnpm"');
  }
}

// Special handlers for specific files
async function updateSpecificFiles() {
  console.log('\n' + '='.repeat(60));
  console.log('Checking specific files that need manual updates...\n');

  const specialFiles = [
    {
      file: 'package.json',
      checks: [
        {
          name: 'packageManager field',
          test: (content) => content.includes('"packageManager": "npm@'),
          message: 'Update packageManager to "pnpm@9.15.4"',
        },
        {
          name: 'engines.npm field',
          test: (content) => content.includes('"npm":'),
          message: 'Replace engines.npm with engines.pnpm',
        },
        {
          name: 'workspaces field',
          test: (content) => content.includes('"workspaces":'),
          message: 'workspaces should be moved to pnpm-workspace.yaml',
        },
      ],
    },
    {
      file: 'turbo.json',
      checks: [
        {
          name: 'package-lock.json in globalDependencies',
          test: (content) => content.includes('package-lock.json'),
          message: 'Update globalDependencies to include pnpm-lock.yaml instead of package-lock.json',
        },
      ],
    },
    {
      file: '.vscode/tasks.json',
      checks: [
        {
          name: 'npm commands in tasks',
          test: (content) => content.includes('npm '),
          message: 'Update VS Code tasks to use pnpm commands',
        },
      ],
    },
  ];

  for (const { file, checks } of specialFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      
      for (const { name, test, message } of checks) {
        if (test(content)) {
          console.log(`⚠️  ${file}: ${name}`);
          console.log(`   → ${message}\n`);
        }
      }
    } catch (error) {
      // File might not exist, skip
    }
  }

  // Check for pnpm-workspace.yaml
  try {
    readFileSync('pnpm-workspace.yaml', 'utf8');
    console.log('✓ pnpm-workspace.yaml exists\n');
  } catch {
    console.log('❌ pnpm-workspace.yaml does not exist');
    console.log('   → Create this file with workspace configurations\n');
  }
}

// Main execution
async function main() {
  try {
    await processFiles();
    await updateSpecificFiles();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
