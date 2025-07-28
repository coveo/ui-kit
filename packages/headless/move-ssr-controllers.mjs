#!/usr/bin/env node

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Script to move all non-commerce SSR controllers from src/controllers to src/ssr/search/controllers
 * while preserving the directory structure.
 */

const SOURCE_DIR = 'src/controllers';
const TARGET_DIR = 'src/ssr/search/controllers';

/**
 * Recursively find all .ssr.ts files in a directory, excluding commerce controllers
 */
function findSSRFiles(dir, basePath = '') {
  const files = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Skip commerce directory
      if (entry.name === 'commerce') {
        console.log(`Skipping commerce directory: ${fullPath}`);
        continue;
      }
      // Recursively search subdirectories
      files.push(...findSSRFiles(fullPath, relativePath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ssr.ts') || entry.name.endsWith('.ssr.test.ts'))
    ) {
      files.push({
        sourceFile: fullPath,
        relativePath: relativePath,
        directory: basePath,
      });
    }
  }

  return files;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Move a file using git mv to preserve history
 */
function moveFile(sourceFile, targetFile) {
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(targetFile);
    ensureDirectory(targetDir);

    // Use git mv to preserve history
    execSync(`git mv "${sourceFile}" "${targetFile}"`, {stdio: 'inherit'});
    console.log(`Moved: ${sourceFile} -> ${targetFile}`);
    return true;
  } catch (error) {
    console.error(`Failed to move ${sourceFile}: ${error.message}`);
    return false;
  }
}

/**
 * Main function to execute the move operation
 */
function main() {
  console.log('Finding all non-commerce SSR controllers...');

  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory ${SOURCE_DIR} does not exist!`);
    process.exit(1);
  }

  // Find all SSR files
  const ssrFiles = findSSRFiles(SOURCE_DIR);

  if (ssrFiles.length === 0) {
    console.log('No SSR controller files found.');
    return;
  }

  console.log(`Found ${ssrFiles.length} SSR controller files to move:`);
  ssrFiles.forEach((file) => console.log(`  - ${file.sourceFile}`));

  // Ensure target directory exists
  ensureDirectory(TARGET_DIR);

  let movedCount = 0;
  let failedCount = 0;

  // Move each file
  for (const file of ssrFiles) {
    const targetFile = path.join(TARGET_DIR, file.relativePath);

    if (moveFile(file.sourceFile, targetFile)) {
      movedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('\n=== Move Operation Summary ===');
  console.log(`Successfully moved: ${movedCount} files`);
  console.log(`Failed to move: ${failedCount} files`);
  console.log(`Total files processed: ${ssrFiles.length}`);

  if (movedCount > 0) {
    console.log('\n=== Next Steps ===');
    console.log('1. Update import statements in affected files');
    console.log('2. Update export statements in index files');
    console.log('3. Run tests to ensure everything still works');
    console.log('4. Commit the changes with git commit');
  }
}

// Run the script
main();
