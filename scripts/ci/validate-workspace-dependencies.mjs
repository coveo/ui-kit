#!/usr/bin/env node
import {readFileSync} from 'fs';
import {join} from 'path';
import {EOL} from 'os';

/**
 * Script to validate that workspace dependencies are used correctly
 * This prevents accidental installation of published versions of internal packages
 */

let exitCode = 0;

/**
 * Read and parse a package.json file
 */
function readPackageJson(path) {
  try {
    const content = readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Only log errors for files that aren't expected to be missing
    if (error.code !== 'ENOENT') {
      console.error(`Error reading ${path}:`, error.message);
    }
    return null;
  }
}

/**
 * Get the list of workspace packages from the root package.json
 */
function getWorkspacePackages(rootPackageJson) {
  const workspaces = rootPackageJson.workspaces || [];
  return workspaces;
}

/**
 * Get the package names that are part of the workspace
 */
function getWorkspacePackageNames(workspaces) {
  const packageNames = new Set();

  // Read each workspace package.json to get the package name
  for (const workspace of workspaces) {
    // Handle glob patterns - for now, we'll handle simple cases
    if (workspace.includes('*')) {
      // Skip glob patterns for now, as they require more complex handling
      continue;
    }

    const packageJsonPath = join(workspace, 'package.json');
    const packageJson = readPackageJson(packageJsonPath);

    if (packageJson && packageJson.name) {
      packageNames.add(packageJson.name);
    }
  }

  return packageNames;
}

/**
 * Check if a dependency version is a workspace reference
 */
function isWorkspaceReference(version) {
  // Common workspace reference patterns:
  // - "workspace:*"
  // - "workspace:^"
  // - "workspace:~"
  // - "workspace:version"
  // - "file:../" (relative path)
  return version.startsWith('workspace:') || version.startsWith('file:');
}

/**
 * Validate dependencies in a package.json
 */
function validatePackageDependencies(
  packageJson,
  packagePath,
  workspacePackageNames
) {
  const issues = [];

  // Check dependency types - we exclude peerDependencies for now as they often need exact versions
  // for published packages to ensure compatibility
  const dependencyTypes = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
  ];

  for (const depType of dependencyTypes) {
    const dependencies = packageJson[depType] || {};

    for (const [depName, depVersion] of Object.entries(dependencies)) {
      // Check if this dependency is a workspace package
      if (workspacePackageNames.has(depName)) {
        // If it's a workspace package, it should use workspace reference
        if (!isWorkspaceReference(depVersion)) {
          issues.push({
            type: 'external-version-of-workspace-package',
            dependencyType: depType,
            packageName: depName,
            currentVersion: depVersion,
            expectedPattern: 'workspace:*',
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating workspace dependencies...\n');

  // Read root package.json
  const rootPackageJson = readPackageJson('package.json');
  if (!rootPackageJson) {
    console.error('❌ Could not read root package.json');
    process.exit(1);
  }

  // Get workspace packages
  const workspaces = getWorkspacePackages(rootPackageJson);
  const workspacePackageNames = getWorkspacePackageNames(workspaces);

  console.log(`Found ${workspacePackageNames.size} workspace packages:`);
  for (const packageName of workspacePackageNames) {
    console.log(`  - ${packageName}`);
  }
  console.log();

  const allIssues = [];

  // Validate each workspace package
  for (const workspace of workspaces) {
    // Skip glob patterns for now
    if (workspace.includes('*')) {
      continue;
    }

    const packageJsonPath = join(workspace, 'package.json');
    const packageJson = readPackageJson(packageJsonPath);

    if (!packageJson) {
      continue;
    }

    const issues = validatePackageDependencies(
      packageJson,
      packageJsonPath,
      workspacePackageNames
    );

    if (issues.length > 0) {
      allIssues.push({
        packageName: packageJson.name,
        packagePath: packageJsonPath,
        issues,
      });
    }
  }

  // Report results
  if (allIssues.length === 0) {
    console.log('✅ All workspace dependencies are correctly configured!');
  } else {
    console.log('❌ Found workspace dependency issues:\n');
    exitCode = 1;

    for (const {packageName, packagePath, issues} of allIssues) {
      console.log(`📦 ${packageName} (${packagePath}):`);

      for (const issue of issues) {
        console.log(
          `  ❌ ${issue.dependencyType}: ${issue.packageName}@${issue.currentVersion}`
        );
        console.log(
          `     Expected: ${issue.packageName}@${issue.expectedPattern}`
        );
        console.log(`     Issue: Using external version of workspace package`);
      }
      console.log();
    }

    console.log('📋 Summary:');
    console.log(
      'Workspace dependencies should use the workspace: protocol to ensure'
    );
    console.log(
      'local development versions are used instead of published versions.'
    );
    console.log(
      'This prevents version conflicts and ensures consistent development.'
    );
    console.log();
    console.log('To fix these issues, update the dependency versions to use:');
    console.log('  "workspace:*"  - for any workspace version');
    console.log('  "workspace:^"  - for compatible workspace versions');
    console.log('  "workspace:~"  - for patch-level workspace versions');
  }

  process.exit(exitCode);
}

// Run the validation
main();
