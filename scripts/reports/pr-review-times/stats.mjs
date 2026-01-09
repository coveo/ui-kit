#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {getOctokit} from '@actions/github';
import {
  PR_REVIEW_LABELS,
  REPO_NAME,
  REPO_OWNER,
  REPORT_OUTPUT_PATH,
} from './constants.mjs';

/**
 * Main execution function
 */
async function main() {
  console.log('Starting PR Review Stats Analysis...');

  const token = process.env.GITHUB_CREDENTIALS || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error(
      'Error: GITHUB_CREDENTIALS or GITHUB_TOKEN environment variable is required.'
    );
    process.exit(1);
  }

  const octokit = getOctokit(token);

  // Cache for team members to avoid rate limits
  const teamMembersCache = new Map();

  try {
    // Phase 2: CODEOWNERS parsing
    console.log('Loading CODEOWNERS...');
    const codeOwners = loadCodeOwners();
    console.log(`Loaded ${codeOwners.length} CODEOWNERS rules.`);

    // Phase 3: Fetch Data
    console.log(`Fetching PRs with label: ${PR_REVIEW_LABELS.CROSS_TEAM}...`);
    const prs = await fetchPRsWithLabel(octokit, PR_REVIEW_LABELS.CROSS_TEAM);
    console.log(`Found ${prs.length} PRs.`);

    // Phase 3: Analysis
    console.log('Analyzing PR blockage duration...');
    const rawBlockages = [];

    for (const pr of prs) {
      console.log(`Analyzing PR #${pr.number}: ${pr.title}`);
      try {
        const blockage = await analyzePR(
          octokit,
          pr,
          codeOwners,
          teamMembersCache
        );
        if (blockage) {
          rawBlockages.push(blockage);
        }
      } catch (e) {
        console.error(`Failed to analyze PR #${pr.number}`, e);
      }
    }

    // Phase 4: Report
    console.log(
      `Generating JSON report for ${rawBlockages.length} blockages...`
    );
    const reportPath = path.resolve(process.cwd(), REPORT_OUTPUT_PATH);
    const reportData = JSON.stringify(rawBlockages, null, 2);
    fs.writeFileSync(reportPath, reportData);
    console.log(`Report written to ${reportPath}`);

    console.log('Done.');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

/**
 * Fetch all PRs (open and closed) with a specific label
 * @param {object} octokit
 * @param {string} label
 */
async function fetchPRsWithLabel(octokit, label) {
  const q = `repo:${REPO_OWNER}/${REPO_NAME} is:pr label:"${label}"`;
  const options = octokit.rest.search.issuesAndPullRequests.endpoint.merge({
    q,
    per_page: 100,
  });

  const results = await octokit.paginate(options);
  // Search returns issues, need to filter/map if necessary, but is:pr handles it.
  // Note: search results might not have all fields?
  // They have `pull_request` property.
  return results;
}

/**
 * Fetch timeline events for a PR
 * @param {object} octokit
 * @param {number} prNumber
 */
async function fetchPREvents(octokit, prNumber) {
  return await octokit.paginate(octokit.rest.issues.listEventsForTimeline, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: prNumber,
    per_page: 100,
  });
}

/**
 * Fetch reviews for a PR
 * @param {object} octokit
 * @param {number} prNumber
 */
async function fetchPRReviews(octokit, prNumber) {
  return await octokit.paginate(octokit.rest.pulls.listReviews, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: prNumber,
    per_page: 100,
  });
}

/**
 * Fetch valid files for a PR (needed for CODEOWNERS check)
 * @param {object} octokit
 * @param {number} prNumber
 */
async function fetchPRFiles(octokit, prNumber) {
  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: prNumber,
    per_page: 100,
  });
  return files.map((f) => f.filename);
}

/**
 * Analyze a single PR
 * @param {object} octokit
 * @param {object} pr
 * @param {Array} codeOwners
 * @param {Map} teamMembersCache
 */
async function analyzePR(octokit, pr, codeOwners, teamMembersCache) {
  const prNumber = pr.number;

  // Fetch timeline events, reviews, and files
  const events = await fetchPREvents(octokit, prNumber);
  const reviews = await fetchPRReviews(octokit, prNumber);
  const files = await fetchPRFiles(octokit, prNumber);

  // Identify Responsible Teams/Owners
  const responsibleOwners = getResponsibleTeams(files, codeOwners);

  // Calculate Per-Team Stats
  const reviewStats = {};
  const teamStatsList = [];

  for (const owner of responsibleOwners) {
    const stats = await analyzeTeamStat(
      octokit,
      owner,
      pr,
      events,
      reviews,
      teamMembersCache
    );
    reviewStats[owner] = stats;
    teamStatsList.push(stats);
  }

  // Calculate Combined Stats
  const combined = calculateCombinedStats(teamStatsList, pr);
  reviewStats._combined = combined;

  return {
    prNumber,
    title: pr.title,
    url: pr.html_url,
    reviews: reviewStats,
    confidence: getConfidence(pr.labels || []),
    author: pr.user.login,
    state: pr.state,
  };
}

/**
 * Calculate combined stats from all team stats
 */
function calculateCombinedStats(statsList, pr) {
  if (statsList.length === 0) {
    return {
      startTime: null,
      endTime: null,
      durationHours: null,
      status: pr.draft ? 'draft' : 'requested',
    };
  }

  // Start Time: Min of all valid start times
  const validStartTimes = statsList
    .map((s) => s.startTime)
    .filter((t) => t)
    .map((t) => new Date(t).getTime());
  let startTime = null;
  if (validStartTimes.length > 0) {
    startTime = new Date(Math.min(...validStartTimes)).toISOString();
  }

  // End Time: Max of end times (if all have end times). If any is null, combined end is null.
  // Exception: If PR is closed/merged, end time might be forced?
  // User says: "endTime: maximum of per-team endTimes."
  // User JSON example shows null combined endTime when one team is null.

  const validEndTimes = statsList.map((s) => s.endTime);
  let endTime = null;

  if (validEndTimes.every((t) => t !== null)) {
    // All finished
    const endTimestamps = validEndTimes.map((t) => new Date(t).getTime());
    endTime = new Date(Math.max(...endTimestamps)).toISOString();
  } else {
    // If not all finished, check if PR is closed.
    // If PR is closed, we might consider the blockage "ended" regardless of approval?
    // But if we stick to the user example: one null -> combined null.
    if (pr.state === 'closed') {
      // If closed, the blockage is over. Use closed_at as fallback max?
      endTime = pr.closed_at;
    } else {
      endTime = null;
    }
  }

  // Duration
  let durationHours = null;
  if (startTime) {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    durationHours = diffMs / (1000 * 60 * 60);
  }

  // Combined Status
  // Priority: draft > changesRequested > asked/commented > approved?
  // User example: "_combined status: changesRequested" when one team is approved, one changesRequested.

  let status = 'requested';
  if (pr.draft) {
    status = 'draft';
  } else if (statsList.some((s) => s.status === 'changesRequested')) {
    status = 'changesRequested';
  } else if (statsList.every((s) => s.status === 'approved')) {
    status = 'approved';
  } else if (statsList.some((s) => s.status === 'commented')) {
    status = 'commented';
  } else if (statsList.some((s) => s.status === 'requested')) {
    status = 'requested';
  } else if (statsList.length === 0) {
    status = 'requested';
  } else {
    status = 'requested'; // Fallback
  }

  return {
    startTime,
    endTime,
    durationHours,
    status,
  };
}

/**
 * Analyze stats for a single team
 */
async function analyzeTeamStat(
  octokit,
  ownerHandle,
  pr,
  events,
  reviews,
  teamMembersCache
) {
  // 1. Determine Reviewers
  let potentialReviewers = [];
  let _isTeam = false;
  // Heuristic for teams vs users
  if (ownerHandle.includes('/')) {
    potentialReviewers = await getTeamMembers(
      octokit,
      ownerHandle,
      teamMembersCache
    );
    _isTeam = true;
  } else {
    potentialReviewers = [ownerHandle.replace('@', '')];
  }

  // 2. Find Start Time: Earliest review_requested event for this team/user
  // If PR was draft, we take the later of (Request Time, Ready For Review Time)
  const requestEvents = events.filter((e) => e.event === 'review_requested');
  const filteredRequests = idxRequestEvents(
    requestEvents,
    ownerHandle,
    potentialReviewers
  );

  let startTime = null;
  if (filteredRequests.length > 0) {
    // Sort by earliest
    filteredRequests.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const firstRequest = filteredRequests[0].created_at;

    // Check Draft Status
    const readyEvents = events.filter((e) => e.event === 'ready_for_review');
    if (pr.draft) {
      // It is CURRENTLY draft.
      // If filteredRequests exists, it means we requested review while in draft?
      // Or before it went back to draft?
      // User says: "draft: PR in draft, do not count review as started".
      // If currently draft, result should be "not started"?
      // But we need to return a structure.
      return {
        startTime: null,
        endTime: null,
        durationHours: null,
        status: 'draft',
      };
    } else {
      // It is NOT currently draft.
      // Did the request happen while it WAS draft?
      // Simple heuristic: If request < last ready_for_review, use valid ready_for_review time.
      const latestReady =
        readyEvents.length > 0
          ? readyEvents.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )[0].created_at
          : null;

      startTime = firstRequest;
      if (latestReady && new Date(latestReady) > new Date(firstRequest)) {
        startTime = latestReady;
      }
    }
  } else {
    // No explicit request found.
    // If it's a code owner, maybe the 'labeled' event (legacy heuristic)?
    // Or if PR is open and older than some date?
    // Default: If no request event, not started.
    // UNLESS we fallback to PR creation if map is empty?
    // Let's return nulls if no request found.
    return {
      startTime: null,
      endTime: null,
      durationHours: null,
      status: 'requested',
    };
  }

  // 3. Status and End Time
  // Calculate Status first
  const relevantReviews = reviews.filter(
    (r) =>
      potentialReviewers.includes(r.user.login) &&
      new Date(r.submitted_at) > new Date(startTime)
  );
  // Sort reviews chronologically
  relevantReviews.sort(
    (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  // Latest review per user
  const latestByUser = new Map();
  for (const r of relevantReviews) {
    latestByUser.set(r.user.login, r);
  }
  const finalReviews = Array.from(latestByUser.values());

  let status = 'requested';
  let endTime = null;

  const hasChangesRequested = finalReviews.some(
    (r) => r.state === 'CHANGES_REQUESTED'
  );
  const hasApproval = finalReviews.some((r) => r.state === 'APPROVED');
  const hasComment = finalReviews.some((r) => r.state === 'COMMENTED');

  // End Time Determination:
  // If Approved: End Time is the timestamp of the *latest* necessary approval?
  // For a Team, ONE approval is usually enough.
  // So find the FIRST approval that happened?

  if (hasChangesRequested) {
    status = 'changesRequested';
    endTime = null; // Blocked
  } else if (hasApproval) {
    status = 'approved';
    // Find the first approval in the list
    const approvals = relevantReviews.filter((r) => r.state === 'APPROVED');
    if (approvals.length > 0) {
      endTime = approvals[0].submitted_at;
    }
  } else if (hasComment) {
    status = 'commented';
    endTime = null;
  }

  // 4. Duration
  let durationHours = null;
  if (startTime) {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    durationHours = diffMs / (1000 * 60 * 60);
  }

  return {
    startTime,
    endTime,
    durationHours,
    status,
  };
}

/**
 * Filter review_request events for a specific owner/team
 */
function idxRequestEvents(events, ownerHandle, members) {
  const slug = ownerHandle.replace('@', '').split('/').pop(); // "dxui" from "@coveo/dxui"

  return events.filter((e) => {
    // Direct team request
    if (e.requested_team && e.requested_team.slug === slug) return true;

    // Member request
    if (e.requested_reviewer && members.includes(e.requested_reviewer.login))
      return true;

    return false;
  });
}

/**
 * Fetch members of a GitHub team with caching
 */
async function getTeamMembers(octokit, teamSlug, cache) {
  if (cache.has(teamSlug)) {
    return cache.get(teamSlug);
  }

  // Parse org and slug from @org/team or similar
  let org = REPO_OWNER;
  let slug = teamSlug;

  if (teamSlug.startsWith('@')) {
    const parts = teamSlug.substring(1).split('/');
    if (parts.length === 2) {
      org = parts[0];
      slug = parts[1];
    } else {
      slug = parts[0];
    }
  }

  try {
    const members = await octokit.paginate(
      octokit.rest.teams.listMembersInOrg,
      {
        org,
        team_slug: slug,
        per_page: 100,
      }
    );
    const logins = members.map((m) => m.login);
    cache.set(teamSlug, logins);
    return logins;
  } catch (e) {
    console.warn(`Failed to fetch members for team ${teamSlug}:`, e.message);
    cache.set(teamSlug, []);
    return [];
  }
}

/**
 * Get distinct responsible teams for the files
 * @param {Array} files
 * @param {Array} codeOwners
 */
function getResponsibleTeams(files, codeOwners) {
  const teams = new Set();
  for (const file of files) {
    const owners = getOwnersForFile(file, codeOwners);
    owners.forEach((o) => {
      teams.add(o);
    });
  }
  return Array.from(teams);
}

/**
 * Extract confidence level from labels
 * @param {Array} labels
 */
function getConfidence(labels) {
  const names = labels.map((l) => l.name);
  if (names.includes(PR_REVIEW_LABELS.HIGH_CONFIDENCE)) return 'high';
  if (names.includes(PR_REVIEW_LABELS.LOW_CONFIDENCE)) return 'low';
  return 'unknown';
}

/**
 * Loads and parses CODEOWNERS file
 */
function loadCodeOwners() {
  const codeOwnersPath = path.resolve(process.cwd(), 'CODEOWNERS');
  if (!fs.existsSync(codeOwnersPath)) {
    console.warn('CODEOWNERS file not found at', codeOwnersPath);
    return [];
  }
  const content = fs.readFileSync(codeOwnersPath, 'utf-8');
  return parseCodeOwners(content);
}

/**
 * Parses CODEOWNERS content into rules
 * @param {string} content
 */
function parseCodeOwners(content) {
  const rules = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Split by whitespace, respecting escaped spaces if any (simplified here)
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue; // Need at least pattern and one owner

    const pattern = parts[0];
    const owners = parts.slice(1);

    rules.push({
      pattern,
      regex: globToRegex(pattern),
      owners,
    });
  }

  // Return reversed to make "first match wins" logic easier if iterating
  // But usually we iterate all and pick the last one.
  // Git logic: Last match wins.
  return rules;
}

/**
 * Simple Glob to Regex converter for CODEOWNERS
 * @param {string} pattern
 */
function globToRegex(pattern) {
  let regexStr = pattern;

  // Escape regex special characters except * and ?
  regexStr = regexStr.replace(/[.+^${}()|[\]\\]/g, '\\$&');

  // Handle double star **
  regexStr = regexStr.replace(/\*\*/g, '.*');

  // Handle single star * (matches non-slash char)
  regexStr = regexStr.replace(/(?<!\.)\*/g, '[^/]+');

  // Handle trailing slash (directory match)
  if (regexStr.endsWith('/')) {
    regexStr += '.*';
  }

  // Handle leading slash (anchor to root)
  if (regexStr.startsWith('/')) {
    regexStr = `^${regexStr.substring(1)}`;
  } else {
    // If no leading slash, it matches anywhere (like **/pattern)
    // But CODEOWNERS says: "If the pattern ends with /, it is recursively..."
    // "If the pattern does not contain a slash /, it matches in any directory"
    // "If the pattern contains a slash / (not at the end), it is relative to root"
    if (pattern.includes('/') && !pattern.endsWith('/')) {
      // Has slash in middle, relative to root (if no leading slash, still usually relative to root in CODEOWNERS?)
      // GitHub docs: "Patterns are relative to the root of the repository"
      // So `packages/foo.md` matches `/packages/foo.md`
      regexStr = `^${regexStr}`;
    } else {
      // No slash, matches anywhere
      regexStr = `.*${regexStr}`;
    }
  }

  // Exact match end unless we added .*
  if (!regexStr.endsWith('.*')) {
    regexStr += '$';
  }

  return new RegExp(regexStr);
}

/**
 * Identify owners for a given file path
 * @param {string} filePath Relative path from root
 * @param {Array} codeOwnersRules
 */
function getOwnersForFile(filePath, codeOwnersRules) {
  // Last match wins
  let owners = [];
  // Ensure filePath starts with nothing (relative) or slash?
  // My regex logic expects ^... or .*...
  // Let's normalize filePath to NOT start with /
  const normalizedPath = filePath.startsWith('/')
    ? filePath.substring(1)
    : filePath;

  for (const rule of codeOwnersRules) {
    if (rule.regex.test(normalizedPath)) {
      owners = rule.owners;
    }
  }
  return owners;
}

main().catch(console.error);
