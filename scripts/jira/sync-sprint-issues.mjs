#!/usr/bin/env node

/**
 * Script to sync Jira sprint issues to GitHub issues
 *
 * Required environment variables:
 * - JIRA_BASE_URL: Jira instance URL (e.g., https://coveord.atlassian.net)
 * - JIRA_EMAIL: Email for Jira authentication
 * - JIRA_API_TOKEN: Jira API token
 * - GITHUB_TOKEN: GitHub token with issues write permission
 * - GITHUB_REPOSITORY: Repository in format owner/repo (e.g., coveo/ui-kit)
 */

import {getOctokit} from '@actions/github';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'coveo/ui-kit';

// Validation
if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing required Jira environment variables');
  console.error('Required: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN');
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN environment variable');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split('/');
if (!owner || !repo) {
  console.error('Invalid GITHUB_REPOSITORY format. Expected: owner/repo');
  process.exit(1);
}

// Initialize GitHub client
const octokit = getOctokit(GITHUB_TOKEN);

/**
 * Fetch active sprint issues from Jira
 */
async function fetchActiveSprintIssues() {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString(
    'base64'
  );

  // First, get the active sprint
  const boardsResponse = await fetch(`${JIRA_BASE_URL}/rest/agile/1.0/board`, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!boardsResponse.ok) {
    throw new Error(
      `Failed to fetch boards: ${boardsResponse.status} ${boardsResponse.statusText}`
    );
  }

  const boardsData = await boardsResponse.json();
  console.log(`Found ${boardsData.values.length} boards`);

  if (boardsData.values.length === 0) {
    console.log('No boards found');
    return [];
  }

  // Use the first board (you may want to filter by name)
  const boardId = boardsData.values[0].id;
  console.log(`Using board: ${boardsData.values[0].name} (ID: ${boardId})`);

  // Get active sprint for the board
  const sprintsResponse = await fetch(
    `${JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!sprintsResponse.ok) {
    throw new Error(
      `Failed to fetch sprints: ${sprintsResponse.status} ${sprintsResponse.statusText}`
    );
  }

  const sprintsData = await sprintsResponse.json();
  console.log(`Found ${sprintsData.values.length} active sprints`);

  if (sprintsData.values.length === 0) {
    console.log('No active sprint found');
    return [];
  }

  const activeSprint = sprintsData.values[0];
  console.log(`Active sprint: ${activeSprint.name} (ID: ${activeSprint.id})`);

  // Get issues in the active sprint
  const issuesResponse = await fetch(
    `${JIRA_BASE_URL}/rest/agile/1.0/sprint/${activeSprint.id}/issue`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!issuesResponse.ok) {
    throw new Error(
      `Failed to fetch sprint issues: ${issuesResponse.status} ${issuesResponse.statusText}`
    );
  }

  const issuesData = await issuesResponse.json();
  console.log(`Found ${issuesData.issues.length} issues in active sprint`);

  return issuesData.issues;
}

/**
 * Get existing GitHub issues with jira label
 */
async function getExistingGitHubIssues() {
  const issues = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: 'jira',
      state: 'all',
      per_page: perPage,
      page,
    });

    issues.push(...response.data);

    if (response.data.length < perPage) {
      break;
    }
    page++;
  }

  console.log(
    `Found ${issues.length} existing GitHub issues with 'jira' label`
  );
  return issues;
}

/**
 * Extract Jira key from GitHub issue title
 */
function extractJiraKey(title) {
  const match = title.match(/^\[([A-Z]+-\d+)\]/);
  return match ? match[1] : null;
}

/**
 * Format Jira issue as GitHub issue
 */
function formatGitHubIssue(jiraIssue) {
  const jiraKey = jiraIssue.key;
  const title = `[${jiraKey}] ${jiraIssue.fields.summary}`;
  const jiraUrl = `${JIRA_BASE_URL}/browse/${jiraKey}`;

  // Build description
  let description = `<!-- Jira Key: ${jiraKey} -->\n\n`;
  description += `🔗 **Jira Issue:** [${jiraKey}](${jiraUrl})\n\n`;

  // Add type/status info
  if (jiraIssue.fields.issuetype) {
    description += `**Type:** ${jiraIssue.fields.issuetype.name}\n`;
  }
  if (jiraIssue.fields.status) {
    description += `**Status:** ${jiraIssue.fields.status.name}\n`;
  }
  if (jiraIssue.fields.priority) {
    description += `**Priority:** ${jiraIssue.fields.priority.name}\n`;
  }

  description += '\n---\n\n';

  // Add Jira description if available
  if (jiraIssue.fields.description) {
    description += '## Description\n\n';
    description += jiraIssue.fields.description;
    description += '\n\n';
  }

  // Add assignee info
  if (jiraIssue.fields.assignee) {
    description += `**Assignee:** ${jiraIssue.fields.assignee.displayName}\n\n`;
  }

  return {
    title,
    body: description,
    labels: ['jira', 'automation'],
  };
}

/**
 * Create or update GitHub issue for Jira issue
 */
async function syncJiraIssue(jiraIssue, existingIssues) {
  const jiraKey = jiraIssue.key;
  const githubIssue = formatGitHubIssue(jiraIssue);

  // Check if issue already exists
  const existing = existingIssues.find(
    (issue) => extractJiraKey(issue.title) === jiraKey
  );

  if (existing) {
    console.log(`Updating existing issue for ${jiraKey}: #${existing.number}`);

    // Update the issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: existing.number,
      title: githubIssue.title,
      body: githubIssue.body,
    });

    return {action: 'updated', number: existing.number, jiraKey};
  } else {
    console.log(`Creating new issue for ${jiraKey}`);

    // Create new issue
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: githubIssue.title,
      body: githubIssue.body,
      labels: githubIssue.labels,
    });

    return {action: 'created', number: response.data.number, jiraKey};
  }
}

/**
 * Main sync function
 */
async function sync() {
  console.log('Starting Jira to GitHub sync...');
  console.log(`Jira: ${JIRA_BASE_URL}`);
  console.log(`GitHub: ${GITHUB_REPOSITORY}`);
  console.log('');

  try {
    // Fetch data
    const jiraIssues = await fetchActiveSprintIssues();
    const existingGitHubIssues = await getExistingGitHubIssues();

    console.log('');
    console.log('Syncing issues...');

    // Sync each Jira issue
    const results = [];
    for (const jiraIssue of jiraIssues) {
      try {
        const result = await syncJiraIssue(jiraIssue, existingGitHubIssues);
        results.push(result);

        // Rate limiting: wait a bit between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to sync ${jiraIssue.key}:`, error.message);
        results.push({
          action: 'failed',
          jiraKey: jiraIssue.key,
          error: error.message,
        });
      }
    }

    // Summary
    console.log('');
    console.log('=== Sync Summary ===');
    console.log(`Total Jira issues: ${jiraIssues.length}`);
    console.log(
      `Created: ${results.filter((r) => r.action === 'created').length}`
    );
    console.log(
      `Updated: ${results.filter((r) => r.action === 'updated').length}`
    );
    console.log(
      `Failed: ${results.filter((r) => r.action === 'failed').length}`
    );
    console.log('');

    // List results
    for (const result of results) {
      if (result.action === 'created') {
        console.log(`✓ Created #${result.number} for ${result.jiraKey}`);
      } else if (result.action === 'updated') {
        console.log(`✓ Updated #${result.number} for ${result.jiraKey}`);
      } else if (result.action === 'failed') {
        console.log(`✗ Failed ${result.jiraKey}: ${result.error}`);
      }
    }

    console.log('');
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
sync();
