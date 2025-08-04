#!/usr/bin/env node

/**
 * Transform turbo's dry-run JSON output to the format expected by bump-package.mjs
 *
 * Input: turbo build --dry-run=json output
 * Output: NX-compatible topology.json format with graph.dependencies and graph.nodes
 */

import {readFileSync, writeFileSync} from 'node:fs';

const inputFile = process.argv[2] || 'topology.json';
const outputFile = process.argv[3] || 'topology.json';

try {
  // Read turbo output
  const turboOutput = JSON.parse(readFileSync(inputFile, 'utf-8'));

  // Extract package information from turbo tasks
  const packageNodes = {};
  const packageDependencies = {};

  // Process each task to build package-level dependency graph
  for (const task of turboOutput.tasks) {
    const packageName = task.package.replace('@coveo/', '');

    // Store package node information
    if (!packageNodes[packageName]) {
      packageNodes[packageName] = {
        data: {
          root: task.directory,
        },
      };
    }

    // Initialize dependencies array for this package if not exists
    if (!packageDependencies[packageName]) {
      packageDependencies[packageName] = [];
    }

    // Extract package-level dependencies from task dependencies
    for (const dependency of task.dependencies) {
      // Parse dependency format: "@coveo/package#task" or just "@coveo/package"
      const [depPackage] = dependency.split('#');
      if (depPackage.startsWith('@coveo/')) {
        const depPackageName = depPackage.replace('@coveo/', '');

        // Only add if it's a different package and not already in dependencies
        if (
          depPackageName !== packageName &&
          !packageDependencies[packageName].some(
            (dep) => dep.target === depPackageName
          )
        ) {
          packageDependencies[packageName].push({
            target: depPackageName,
          });
        }
      }
    }
  }

  // Create the output format expected by bump-package.mjs
  const output = {
    graph: {
      dependencies: packageDependencies,
      nodes: packageNodes,
    },
  };

  // Write transformed output
  writeFileSync(outputFile, JSON.stringify(output, null, 2));

  console.log(
    `Transformed ${Object.keys(packageNodes).length} packages with dependencies to ${outputFile}`
  );
} catch (error) {
  console.error('Error transforming topology:', error.message);
  process.exit(1);
}
