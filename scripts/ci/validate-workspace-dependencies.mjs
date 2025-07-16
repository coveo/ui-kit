#!/usr/bin/env node
import {readFileSync} from 'fs';
import {join} from 'path';
import {EOL} from 'os';
import {glob} from 'glob';

/**
 * Script to validate that workspace dependencies are used correctly in npm workspaces
 * This prevents accidental installation of wrong versions of internal packages
 * by ensuring that workspace package dependencies reference the correct versions
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
    // and aren't caused by directories being treated as files
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
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
 * Get the package names and versions that are part of the workspace
 */
function getWorkspacePackageInfo(workspaces) {
  const packageInfo = new Map();

  // Read each workspace package.json to get the package name and version
  for (const workspace of workspaces) {
    // Handle glob patterns
    if (workspace.includes('*')) {
      // For glob patterns, we need to find all matching directories
      try {
        const matches = glob.sync(workspace, {onlyDirectories: true});
        for (const match of matches) {
          const packageJsonPath = join(match, 'package.json');
          const packageJson = readPackageJson(packageJsonPath);
          if (packageJson && packageJson.name) {
            packageInfo.set(packageJson.name, {
              version: packageJson.version,
              path: packageJsonPath,
            });
          }
        }
      } catch (error) {
        // If glob fails, skip this workspace pattern
        console.warn(
          `Warning: Could not process workspace pattern '${workspace}': ${error.message}`
        );
        continue;
      }
    } else {
      // Handle direct workspace paths
      const packageJsonPath = join(workspace, 'package.json');
      const packageJson = readPackageJson(packageJsonPath);

      if (packageJson && packageJson.name) {
        packageInfo.set(packageJson.name, {
          version: packageJson.version,
          path: packageJsonPath,
        });
      }
    }
  }

  return packageInfo;
}

/**
 * Check if a dependency version is a valid workspace reference for npm workspaces
 * npm workspaces support:
 * - Exact version matches with workspace package versions
 * - File path references (file:../package-name)
 * - Version ranges that include the workspace version
 */
function isValidWorkspaceReference(version, workspaceVersion) {
  // Allow file: protocol references (common in npm workspaces)
  if (version.startsWith('file:')) {
    return true;
  }

  // For npm workspaces, exact version match is the most common and safest approach
  if (version === workspaceVersion) {
    return true;
  }

  // Check if version range includes workspace version
  // This is a simplified check - in a real implementation you'd use semver.satisfies
  // but for now we'll be strict and require exact matches
  return false;
}

/**
 * Validate dependencies in a package.json for npm workspaces
 */
function validatePackageDependencies(
  packageJson,
  packagePath,
  workspacePackageInfo
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
      if (workspacePackageInfo.has(depName)) {
        const workspaceInfo = workspacePackageInfo.get(depName);

        // For npm workspaces, validate that the version reference is appropriate
        if (!isValidWorkspaceReference(depVersion, workspaceInfo.version)) {
          issues.push({
            type: 'incorrect-workspace-version',
            dependencyType: depType,
            packageName: depName,
            currentVersion: depVersion,
            expectedVersion: workspaceInfo.version,
            workspacePath: workspaceInfo.path,
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
  const workspacePackageInfo = getWorkspacePackageInfo(workspaces);

  console.log(`Found ${workspacePackageInfo.size} workspace packages:`);
  for (const [packageName, info] of workspacePackageInfo) {
    console.log(`  - ${packageName}@${info.version}`);
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
      workspacePackageInfo
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
          `     Expected: ${issue.packageName}@${issue.expectedVersion}`
        );
        console.log(`     Issue: Version mismatch with workspace package`);
        console.log(`     Workspace package: ${issue.workspacePath}`);
      }
      console.log();
    }

    console.log('📋 Summary:');
    console.log(
      'In npm workspaces, dependencies on workspace packages should reference'
    );
    console.log(
      'the exact version that matches the workspace package version.'
    );
    console.log(
      'This ensures that the local workspace version is used during development.'
    );
    console.log();
    console.log('To fix these issues, update the dependency versions to match');
    console.log(
      'the current workspace package versions, or use file: protocol'
    );
    console.log(
      'references for local development (e.g., "file:../package-name").'
    );
  }

  process.exit(exitCode);
}

// Run the validation
main();
