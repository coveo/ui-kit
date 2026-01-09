#!/usr/bin/env node

import {getOctokit} from '@actions/github';
import {aggregateReports} from './aggregate.mjs';
import {backfillCrossTeamLabel} from './backfill-label.mjs';
import {loadCodeOwners} from './codeowners.mjs';
import {fetchAndAnalyzePr} from './fetch-pr.mjs';
import {listPrs} from './list-prs.mjs';
import {getStoredPrMetadata, savePrData} from './storage.mjs';

const USAGE = `
Usage:
  node index.mjs fetch <query> [--force]   Fetch PRs matching query and save data.
  node index.mjs report                    Generate aggregation report from local data.
  node index.mjs backfill-labels <query>   Backfill 'cross-team' labels.
  
  Example:
  node index.mjs fetch "repo:coveo/ui-kit is:pr is:merged created:>2023-01-01"
  node index.mjs backfill-labels "is:pr created:>2025-11-01"
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(USAGE);
    process.exit(1);
  }

  if (command === 'fetch') {
    const query = args[1];
    const force = args.includes('--force');

    if (!query) {
      console.error('Error: Missing query argument.');
      console.log(USAGE);
      process.exit(1);
    }

    const token = process.env.GITHUB_CREDENTIALS || process.env.GITHUB_TOKEN;
    if (!token) {
      console.error(
        'Error: GITHUB_CREDENTIALS or GITHUB_TOKEN environment variable is required.'
      );
      process.exit(1);
    }

    const octokit = getOctokit(token);
    const teamMembersCache = new Map();

    console.log(`Fetching PRs with query: "${query}"...`);

    // Load Codeowners once
    const codeOwnersRules = loadCodeOwners();

    try {
      const prList = await listPrs(octokit, query);
      console.log(`Found ${prList.length} PRs.`);

      for (const [index, pr] of prList.entries()) {
        const prNumber = pr.number;

        let shouldFetch = false;
        if (force) {
          shouldFetch = true;
        } else {
          const localMeta = getStoredPrMetadata(prNumber);
          if (!localMeta || !localMeta.updatedAt) {
            shouldFetch = true;
          } else if (new Date(pr.updated_at) > new Date(localMeta.updatedAt)) {
            shouldFetch = true;
          }
        }

        if (!shouldFetch) {
          process.stdout.write('.');
          continue;
        }

        console.log(
          `\n[${index + 1}/${prList.length}] Analyzing PR #${prNumber}...`
        );
        try {
          const analysis = await fetchAndAnalyzePr(
            octokit,
            pr,
            codeOwnersRules,
            teamMembersCache
          );
          savePrData(analysis);
          console.log(`Saved data for PR #${prNumber}`);
        } catch (err) {
          console.error(`Failed to analyze PR #${prNumber}:`, err.message);
        }
      }
      console.log('\nFetch complete.');
    } catch (err) {
      console.error('Error fetching PRs:', err);
      process.exit(1);
    }
  } else if (command === 'report') {
    try {
      aggregateReports();
    } catch (err) {
      console.error('Error generating report:', err);
      process.exit(1);
    }
  } else if (command === 'backfill-labels') {
    const query = args[1];
    if (!query) {
      console.error('Error: Missing query argument.');
      console.log(USAGE);
      process.exit(1);
    }

    const token = process.env.GITHUB_CREDENTIALS || process.env.GITHUB_TOKEN;
    if (!token) {
      console.error(
        'Error: GITHUB_CREDENTIALS or GITHUB_TOKEN environment variable is required.'
      );
      process.exit(1);
    }
    const octokit = getOctokit(token);

    try {
      await backfillCrossTeamLabel(octokit, query);
    } catch (err) {
      console.error('Error in backfill:', err);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    console.log(USAGE);
    process.exit(1);
  }
}

main();
