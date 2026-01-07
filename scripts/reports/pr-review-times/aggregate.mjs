import fs from 'node:fs';
import path from 'node:path';
import {calculateBusinessHours} from './holidays.mjs';
import {DATA_DIR, loadAllPrData} from './storage.mjs';

/**
 * Main Aggregation Function
 */
export function aggregateReports() {
  console.log('Starting PR Review Aggregation...');

  const prs = loadAllPrData();
  console.log(`Loaded ${prs.length} PR records.`);

  const aggReport = {
    global: calculateAggregate(prs, '_combined'),
    byConfidence: {},
    byTeam: {},
    openOverTime: calculateDailyOpenCounts(prs),
  };

  // Group by Confidence
  const confidenceLevels = ['high', 'low', 'unknown'];
  for (const level of confidenceLevels) {
    const levelPrs = prs.filter((p) => p.confidence === level);
    if (levelPrs.length > 0) {
      aggReport.byConfidence[level] = calculateAggregate(levelPrs, '_combined');
    }
  }

  // Group by Team
  const allTeams = new Set();
  prs.forEach((p) => {
    if (p.reviews) {
      Object.keys(p.reviews).forEach((t) => {
        if (t !== '_combined') allTeams.add(t);
      });
    }
  });

  for (const team of allTeams) {
    const teamPrs = prs.filter((p) => {
      const hasReview = p.reviews && team in p.reviews;
      if (!hasReview) return false;

      // Ignore PRs that are in draft or closed (without merging) for per-team stats
      if (p.status === 'draft') return false;
      if (p.status === 'closed') return false;

      return true;
    });

    // Calculate aggregate and break down by confidence
    const aggregated = calculateAggregate(teamPrs, team);

    const confidenceStats = {};
    for (const level of confidenceLevels) {
      const levelPrs = teamPrs.filter((p) => p.confidence === level);
      if (levelPrs.length > 0) {
        confidenceStats[level] = calculateAggregate(levelPrs, team);
      }
    }

    // Store in new structure for byTeam
    aggReport.byTeam[team] = {
      aggregated,
      byConfidence: confidenceStats,
    };
  }

  // Output JSON
  const aggPath = path.resolve(DATA_DIR, '../aggregated.json');
  fs.writeFileSync(aggPath, JSON.stringify(aggReport, null, 2));
  console.log(`Aggregation report written to ${aggPath}`);

  // Output CSV
  const csvPath = path.resolve(DATA_DIR, '../aggregated.csv');
  generateCsv(aggReport, csvPath);

  // Print Summary to Console
  printSummary(aggReport);
}

function calculateAggregate(prs, teamKey) {
  const counts = {
    total: 0,
    draft: 0,
    requested: 0,
    pending: 0,
    reviewed: 0,
    merged: 0,
    closed: 0,
  };

  // We separate duration stats into:
  // 1. Pending: PR is open and not yet reviewed. Duration = (Now - StartTime)
  // 2. Reviewed: PR is reviewed (approved/changes requested). Duration = (ReviewTime - StartTime)

  const pendingDurationValues = [];
  const reviewedDurationValues = [];

  for (const p of prs) {
    const stats =
      teamKey === '_combined' ? calculateCombinedStats(p) : p.reviews[teamKey];

    if (!stats) continue;

    counts.total++;

    if (p.status === 'draft') {
      counts.draft++;
      continue;
    }

    counts.requested++;

    if (p.status === 'merged') {
      counts.merged++;
    } else if (p.status === 'closed') {
      counts.closed++;
    }

    // Reviewed Stats (Independent of PR status - if it was reviewed, count it)
    const isReviewed =
      stats.status === 'approved' || stats.status === 'changesRequested';

    if (isReviewed) {
      counts.reviewed++;
      // Use updated businessDays if available, or fallback to durationHours for older data
      const days =
        stats.businessDays !== undefined
          ? stats.businessDays
          : stats.durationHours
            ? stats.durationHours / 24
            : null;
      if (days !== null) {
        reviewedDurationValues.push(days);
      }
    } else {
      // Pending Stats (Only if PR is still Open and review was started)
      if (p.state === 'open' && stats.startTime) {
        counts.pending++;
        const pendingHours = calculateBusinessHours(
          stats.startTime,
          new Date().toISOString()
        );
        const pendingDays = pendingHours !== null ? pendingHours / 24 : 0;
        pendingDurationValues.push(pendingDays);
      }
    }
  }

  // Verification
  if (counts.total !== counts.draft + counts.requested) {
    throw new Error(
      `Integrity check failed: Total (${counts.total}) != Draft (${counts.draft}) + Requested (${counts.requested})`
    );
  }
  // Note: Requested != Pending + Reviewed + Merged + Closed anymore because Reviewed interacts with Merged/Closed.

  return {
    counts,
    pendingDuration: calculateStats(pendingDurationValues),
    reviewedDuration: calculateStats(reviewedDurationValues),
  };
}

/**
 * Calculate basic stats (Avg, P95)
 * @param {Array<number>} values
 */
function calculateStats(values) {
  if (!values || values.length === 0) {
    return {count: 0};
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = sorted[sorted.length - 1];

  const p95Index = Math.floor(values.length * 0.95);
  const p95 = sorted[p95Index];

  return {
    count: values.length,
    avg: parseFloat(avg.toFixed(2)),
    p95: parseFloat(p95.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
  };
}

/**
 * Calculate count of open blocked PRs per day
 * @param {Array} prs
 */
function calculateDailyOpenCounts(prs) {
  // Use combined start/end times
  let minDate = new Date();
  let maxDate = new Date(0); // Epoch

  const validPrs = [];
  prs.forEach((p) => {
    const stats = calculateCombinedStats(p);
    // Attach to p for reuse within this function scope
    p._tempCombined = stats;
    if (stats.startTime) validPrs.push(p);
  });

  if (validPrs.length === 0) return {};

  validPrs.forEach((p) => {
    const stats = p._tempCombined;
    const start = new Date(stats.startTime);
    const end = stats.endTime ? new Date(stats.endTime) : new Date();

    if (start < minDate) minDate = start;
    if (end > maxDate) maxDate = end;
  });

  const dailyCounts = {};
  const runner = new Date(minDate);
  runner.setHours(0, 0, 0, 0);

  const endDate = new Date(maxDate);
  endDate.setHours(0, 0, 0, 0);

  while (runner <= endDate) {
    const dateStr = runner.toISOString().split('T')[0];
    const eod = new Date(runner);
    eod.setHours(23, 59, 59, 999);

    const count = validPrs.filter((p) => {
      const stats = p._tempCombined;
      const start = new Date(stats.startTime);

      // Started before EOD
      if (start > eod) return false;

      // Ended after EOD or not ended
      if (stats.endTime) {
        const end = new Date(stats.endTime);
        if (end < eod) return false;
      }

      return true;
    }).length;

    dailyCounts[dateStr] = count;
    runner.setDate(runner.getDate() + 1);
  }

  return dailyCounts;
}

function printSummary(report) {
  console.log('\n=========================================');
  console.log('   PR Review Aggregation Summary');
  console.log('   (Values in Business Days)');
  console.log('=========================================\n');

  console.log('Global Stats:');
  printGlobalStats(report.global, '  ');

  console.log('\n-----------------------------------------');
  console.log('By Team (Sorted by Volume)');
  console.log('-----------------------------------------');

  const sortedTeams = Object.entries(report.byTeam).sort(
    ([, a], [, b]) =>
      b.aggregated.counts.requested - a.aggregated.counts.requested
  );

  sortedTeams.forEach(([team, data]) => {
    // Check if there's anything to report (Aggregated covers all subsections)
    if (!hasStats(data.aggregated)) return;

    console.log(`\n${team}`);

    // Aggregated
    console.log(`  Aggregated:`);
    printStatBlock(data.aggregated, '    ');

    // By Confidence
    if (data.byConfidence) {
      Object.entries(data.byConfidence).forEach(([level, stats]) => {
        if (level === 'unknown') return;
        if (!hasStats(stats)) return;

        console.log(`\n  ${capitalize(level)} Confidence:`);
        printStatBlock(stats, '    ');
      });
    }
  });
  console.log('\n=========================================\n');
}

function hasStats(stats) {
  return stats.counts.reviewed > 0 || stats.counts.pending > 0;
}

function printGlobalStats(stats, indent) {
  const c = stats.counts;
  console.log(`${indent}Total:     ${c.total}`);
  console.log(`${indent}Draft:     ${c.draft}`);
  console.log(`${indent}Requested: ${c.requested}`);

  // Pending line
  let pendingDur = '';
  if (stats.pendingDuration.count > 0) {
    pendingDur = ` / avg=${stats.pendingDuration.avg} / p95=${stats.pendingDuration.p95}`;
  }
  console.log(`${indent}Pending:   ${c.pending}${pendingDur}`);

  // Reviewed line
  let reviewedDur = '';
  if (stats.reviewedDuration.count > 0) {
    reviewedDur = ` / avg=${stats.reviewedDuration.avg} / p95=${stats.reviewedDuration.p95}`;
  }
  console.log(`${indent}Reviewed:  ${c.reviewed}${reviewedDur}`);

  console.log(`${indent}Merged:    ${c.merged}`);
  console.log(`${indent}Closed:    ${c.closed}`);
}

function printStatBlock(stats, indent) {
  if (stats.counts.pending > 0) {
    let dur = '';
    if (stats.pendingDuration.count > 0) {
      dur = ` / avg=${stats.pendingDuration.avg} / p95=${stats.pendingDuration.p95}`;
    }
    console.log(`${indent}Pending:  ${stats.counts.pending}${dur}`);
  }

  if (stats.counts.reviewed > 0) {
    let dur = '';
    if (stats.reviewedDuration.count > 0) {
      dur = ` / avg=${stats.reviewedDuration.avg} / p95=${stats.reviewedDuration.p95}`;
    }
    console.log(`${indent}Reviewed: ${stats.counts.reviewed}${dur}`);
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateCsv(report, filepath) {
  const headers = [
    'Team',
    'Confidence',
    'Total',
    'Draft',
    'Requested',
    'Pending',
    'Reviewed',
    'Merged',
    'Closed',
    'PendingDuration_Avg_Days',
    'PendingDuration_P95_Days',
    'ReviewedDuration_Avg_Days',
    'ReviewedDuration_P95_Days',
  ];

  const rows = [];

  // Helper to format stats into a CSV row
  const addRow = (team, confidence, stats) => {
    rows.push(
      [
        team,
        confidence,
        stats.counts.total,
        stats.counts.draft,
        stats.counts.requested,
        stats.counts.pending,
        stats.counts.reviewed,
        stats.counts.merged,
        stats.counts.closed,
        stats.pendingDuration.count > 0 ? stats.pendingDuration.avg : '',
        stats.pendingDuration.count > 0 ? stats.pendingDuration.p95 : '',
        stats.reviewedDuration.count > 0 ? stats.reviewedDuration.avg : '',
        stats.reviewedDuration.count > 0 ? stats.reviewedDuration.p95 : '',
      ].join(',')
    );
  };

  // Global
  addRow('Global', 'All', report.global);
  if (report.byConfidence) {
    Object.entries(report.byConfidence).forEach(([level, stats]) => {
      addRow('Global', capitalize(level), stats);
    });
  }

  // By Team
  Object.entries(report.byTeam).forEach(([team, data]) => {
    // Aggregated for team
    addRow(team, 'All', data.aggregated);

    // Breakdown by confidence
    if (data.byConfidence) {
      Object.entries(data.byConfidence).forEach(([level, stats]) => {
        addRow(team, capitalize(level), stats);
      });
    }
  });

  const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
  fs.writeFileSync(filepath, csvContent);
  console.log(`CSV report written to ${filepath}`);
}

/**
 * Calculate combined stats from all team stats for a PR
 * @param {object} pr
 */
function calculateCombinedStats(pr) {
  // Extract stats from all teams (excluding any potential _combined key if it exists)
  const statsList = Object.keys(pr.reviews || {})
    .filter((k) => k !== '_combined')
    .map((k) => pr.reviews[k]);

  if (statsList.length === 0) {
    return {
      startTime: null,
      endTime: null,
      businessDays: null,
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
  const validEndTimes = statsList.map((s) => s.endTime);
  let endTime = null;

  if (validEndTimes.every((t) => t !== null)) {
    // All finished
    const endTimestamps = validEndTimes.map((t) => new Date(t).getTime());
    endTime = new Date(Math.max(...endTimestamps)).toISOString();
  } else {
    // If PR is closed, end time is closedAt for the whole PR
    // If closedAt is missing (old data), fallback to null (pending)
    if (pr.status === 'closed' || pr.status === 'merged') {
      // Support legacy _combined.endTime if closedAt is missing
      const legacyCombinedEnd = pr.reviews?._combined?.endTime;
      endTime = pr.closedAt || pr.mergedAt || legacyCombinedEnd || null;
    } else {
      endTime = null;
    }
  }

  // Duration
  let businessDays = null;
  if (startTime) {
    // Use Business Hours
    const endIso = endTime ? endTime : new Date().toISOString();
    const hours = calculateBusinessHours(startTime, endIso);
    businessDays = hours !== null ? hours / 24 : null;
  }

  // Combined Status
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
  }

  return {
    startTime,
    endTime,
    businessDays,
    status,
  };
}
