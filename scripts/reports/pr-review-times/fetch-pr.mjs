// scripts/reports/pr-review-times/fetch-pr.mjs

import {getOwnersForFile} from './codeowners.mjs';
import {PR_REVIEW_LABELS, REPO_NAME, REPO_OWNER} from './constants.mjs';
import {calculateBusinessHours} from './holidays.mjs';

/**
 * Fetch and Analyze a single PR
 * @param {object} octokit
 * @param {object} pr Basic PR info object
 * @param {Array} codeOwners Preloaded codeowners rules
 * @param {Map} teamMembersCache Cache for github team members
 */
export async function fetchAndAnalyzePr(
  octokit,
  pr,
  codeOwners,
  teamMembersCache
) {
  const prNumber = pr.number;

  // Fetch full PR details (needed for base branch), timeline events, reviews, and files
  const {data: fullPr} = await octokit.rest.pulls.get({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: prNumber,
  });

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
      fullPr,
      events,
      reviews,
      teamMembersCache
    );
    reviewStats[owner] = stats;
    teamStatsList.push(stats);
  }

  // Calculate Status
  const isMerged = events.some((e) => e.event === 'merged');
  let status = 'unknown';

  if (isMerged) {
    status = 'merged';
  } else if (fullPr.state === 'closed') {
    status = 'closed';
  } else if (fullPr.draft) {
    status = 'draft';
  } else {
    status = 'ready_for_review';
  }

  return {
    prNumber,
    title: fullPr.title,
    url: fullPr.html_url,
    reviews: reviewStats,
    confidence: getConfidence(fullPr.labels || []),
    author: fullPr.user.login,
    state: fullPr.state,
    status,
    createdAt: fullPr.created_at,
    closedAt: fullPr.closed_at,
    mergedAt: fullPr.merged_at,
    baseBranch: fullPr.base.ref,
    updatedAt: fullPr.updated_at,
  };
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
  // Heuristic for teams vs users
  if (ownerHandle.includes('/')) {
    potentialReviewers = await getTeamMembers(
      octokit,
      ownerHandle,
      teamMembersCache
    );
  } else {
    potentialReviewers = [ownerHandle.replace('@', '')];
  }

  // 2. Find Start Time: Earliest review_requested event for this team/user
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
      return {
        startTime: null,
        endTime: null,
        businessDays: null,
        status: 'draft',
      };
    } else {
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
    return {
      startTime: null,
      endTime: null,
      businessDays: null,
      status: 'requested',
    };
  }

  // 3. Status and End Time
  const relevantReviews = reviews.filter(
    (r) =>
      potentialReviewers.includes(r.user.login) &&
      new Date(r.submitted_at) > new Date(startTime)
  );
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

  if (hasChangesRequested) {
    status = 'changesRequested';
    const changes = relevantReviews.filter(
      (r) => r.state === 'CHANGES_REQUESTED'
    );
    if (changes.length > 0) {
      endTime = changes[0].submitted_at;
    }
  } else if (hasApproval) {
    status = 'approved';
    const approvals = relevantReviews.filter((r) => r.state === 'APPROVED');
    if (approvals.length > 0) {
      endTime = approvals[0].submitted_at;
    }
  } else if (hasComment) {
    status = 'commented';
    endTime = null;
  }

  // 4. Override status for Closed/Merged PRs if still requested
  if (status === 'requested') {
    const isMerged = events.some((e) => e.event === 'merged');
    const isClosed = pr.state === 'closed';

    if (isMerged) {
      status = 'dismissed'; // Merged without this team's approval
    } else if (isClosed) {
      status = 'cancelled'; // Closed without merge => cancelled
    }
  }

  // 5. Duration
  let businessDays = null;
  if (startTime) {
    const endIso = endTime ? endTime : new Date().toISOString();
    const hours = calculateBusinessHours(startTime, endIso);
    businessDays = hours !== null ? hours / 24 : null;
  }

  return {
    startTime,
    endTime,
    businessDays,
    status,
  };
}

/**
 * Filter review_request events for a specific owner/team
 */
function idxRequestEvents(events, ownerHandle, members) {
  const slug = ownerHandle.replace('@', '').split('/').pop();

  return events.filter((e) => {
    if (e.requested_team && e.requested_team.slug === slug) return true;
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

function getConfidence(labels) {
  const names = labels.map((l) => l.name);
  if (names.includes(PR_REVIEW_LABELS.HIGH_CONFIDENCE)) return 'high';
  if (names.includes(PR_REVIEW_LABELS.LOW_CONFIDENCE)) return 'low';
  return 'unknown';
}
