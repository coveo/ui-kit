/**
 * generate-a11y-issues.ts
 *
 * Reads manual audit JSON files, extracts actual failures, and generates
 * GitHub CLI commands to file issues. Supports dry-run (default) and
 * --execute mode.
 *
 * Usage:
 *   node a11y/scripts/generate-a11y-issues.mjs            # Dry run — prints commands
 *   node a11y/scripts/generate-a11y-issues.mjs --execute   # Files issues via gh CLI
 *   node a11y/scripts/generate-a11y-issues.mjs --json      # Output structured JSON
 *
 * CWD assumption: run from a package root that contains ./a11y/reports.
 */

import {execSync} from 'node:child_process';
import {readdir} from 'node:fs/promises';
import path from 'node:path';
import {readJsonFile} from '../src/shared/file-utils.js';

const REPORTS_DIR = 'a11y/reports';
const DELTAS_DIR = path.join(REPORTS_DIR, 'deltas');
const DELTA_PATTERN = /^delta-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/;
const AUDIT_FILE_PATTERN = /^manual-audit-(.+)\.json$/;
const VIOLATIONS_FILE_PATTERN = /^manual-audit-(.+)-violations\.json$/;
const REPO = 'coveo/ui-kit';

interface CriterionInfo {
  criterion: string;
  name: string;
  level: string;
}

const WCAG_CRITERIA_LABELS: Record<string, CriterionInfo> = {
  '2.4.11-focus-not-obscured': {
    criterion: 'WCAG 2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: 'AA',
  },
  '2.5.7-dragging-movements': {
    criterion: 'WCAG 2.5.7',
    name: 'Dragging Movements',
    level: 'AA',
  },
  '2.5.8-target-size': {
    criterion: 'WCAG 2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
  },
  '3.2.6-consistent-help': {
    criterion: 'WCAG 3.2.6',
    name: 'Consistent Help',
    level: 'A',
  },
  '3.3.7-redundant-entry': {
    criterion: 'WCAG 3.3.7',
    name: 'Redundant Entry',
    level: 'A',
  },
  '3.3.8-accessible-auth': {
    criterion: 'WCAG 3.3.8',
    name: 'Accessible Authentication (Minimum)',
    level: 'AA',
  },
};

function getCriterionInfo(criterionKey: string): CriterionInfo {
  const key = criterionKey.replace(/=.*$/, '');
  return (
    WCAG_CRITERIA_LABELS[key] ?? {
      criterion: key,
      name: key,
      level: 'unknown',
    }
  );
}

function extractSurface(filename: string): string {
  const violationsMatch = filename.match(VIOLATIONS_FILE_PATTERN);
  if (violationsMatch) {
    return violationsMatch[1];
  }

  const auditMatch = filename.match(AUDIT_FILE_PATTERN);
  if (auditMatch) {
    return auditMatch[1];
  }

  return 'unknown';
}

interface Issue {
  component: string;
  surface: string;
  criterion: string;
  criterionName: string;
  level: string;
  notes: string;
}

interface ViolationEntry {
  name: string;
  failures?: string[];
  notes?: string;
}

async function extractFromViolationsFile(
  filePath: string,
  surface: string
): Promise<Issue[]> {
  const entries = await readJsonFile<ViolationEntry[]>(filePath);
  if (!Array.isArray(entries)) {
    return [];
  }

  const issues: Issue[] = [];

  for (const entry of entries) {
    if (!entry.failures || !Array.isArray(entry.failures)) {
      continue;
    }

    for (const failure of entry.failures) {
      const criterionKey = failure.replace(/=.*$/, '');
      const info = getCriterionInfo(criterionKey);

      issues.push({
        component: entry.name,
        surface,
        criterion: info.criterion,
        criterionName: info.name,
        level: info.level,
        notes: entry.notes ?? '',
      });
    }
  }

  return issues;
}

interface DeltaEntry {
  name: string;
  surface: string;
  results?: {
    keyboardNav?: string;
    screenReader?: string;
    focusManagement?: string;
    wcag22Criteria?: Record<string, string>;
    notes?: string;
  };
}

interface DeltaFile {
  entries?: DeltaEntry[];
}

async function extractFromDeltaFile(filePath: string): Promise<Issue[]> {
  const content = await readJsonFile<DeltaFile>(filePath);
  if (!content || !Array.isArray(content.entries)) {
    return [];
  }

  const issues: Issue[] = [];

  for (const entry of content.entries) {
    const results = entry.results;
    if (!results) continue;

    if (results.keyboardNav === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.surface,
        criterion: 'WCAG 2.1.1',
        criterionName: 'Keyboard',
        level: 'A',
        notes: results.notes ?? '',
      });
    }

    if (results.screenReader === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.surface,
        criterion: 'WCAG 4.1.2',
        criterionName: 'Name, Role, Value',
        level: 'A',
        notes: results.notes ?? '',
      });
    }

    if (results.focusManagement === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.surface,
        criterion: 'WCAG 2.4.7',
        criterionName: 'Focus Visible',
        level: 'AA',
        notes: results.notes ?? '',
      });
    }

    const wcag22 = results.wcag22Criteria;
    if (!wcag22) continue;

    for (const [key, value] of Object.entries(wcag22)) {
      if (value === 'fail') {
        const info = getCriterionInfo(key);
        issues.push({
          component: entry.name,
          surface: entry.surface,
          criterion: info.criterion,
          criterionName: info.name,
          level: info.level,
          notes: results.notes ?? '',
        });
      }
    }
  }

  return issues;
}

interface AuditEntry {
  name: string;
  category?: string;
  manual?: {
    keyboardNav?: string;
    screenReader?: string;
    focusManagement?: string;
    wcag22Criteria?: Record<string, string>;
    notes?: string;
  };
}

async function extractFromAuditFile(
  filePath: string,
  surface: string
): Promise<Issue[]> {
  const entries = await readJsonFile<AuditEntry[]>(filePath);
  if (!Array.isArray(entries)) {
    return [];
  }

  const issues: Issue[] = [];

  for (const entry of entries) {
    const manual = entry.manual;
    if (!manual) {
      continue;
    }

    if (manual.keyboardNav === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.category ?? surface,
        criterion: 'WCAG 2.1.1',
        criterionName: 'Keyboard',
        level: 'A',
        notes: manual.notes ?? '',
      });
    }

    if (manual.screenReader === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.category ?? surface,
        criterion: 'WCAG 4.1.2',
        criterionName: 'Name, Role, Value',
        level: 'A',
        notes: manual.notes ?? '',
      });
    }

    if (manual.focusManagement === 'fail') {
      issues.push({
        component: entry.name,
        surface: entry.category ?? surface,
        criterion: 'WCAG 2.4.7',
        criterionName: 'Focus Visible',
        level: 'AA',
        notes: manual.notes ?? '',
      });
    }

    const wcag22 = manual.wcag22Criteria;
    if (!wcag22) {
      continue;
    }

    for (const [key, value] of Object.entries(wcag22)) {
      if (value === 'fail') {
        const info = getCriterionInfo(key);
        issues.push({
          component: entry.name,
          surface: entry.category ?? surface,
          criterion: info.criterion,
          criterionName: info.name,
          level: info.level,
          notes: manual.notes ?? '',
        });
      }
    }
  }

  return issues;
}

function deduplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.component}:${issue.criterion}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildIssueBody(issue: Issue): string {
  return [
    `## Accessibility Violation`,
    ``,
    `**Component:** \`${issue.component}\``,
    `**Surface:** ${issue.surface}`,
    `**WCAG Criterion:** ${issue.criterion} — ${issue.criterionName} (Level ${issue.level})`,
    `**Source:** Manual audit (Playwright-assisted)`,
    ``,
    `## Details`,
    ``,
    issue.notes || '_No additional notes from audit._',
    ``,
    `## Steps to Reproduce`,
    ``,
    `1. Run \`pnpm run storybook\` in \`packages/atomic\``,
    `2. Navigate to the \`${issue.component}\` story`,
    `3. Test the failing criterion (${issue.criterionName})`,
    ``,
    `## Acceptance Criteria`,
    ``,
    `- [ ] Component passes ${issue.criterion} (${issue.criterionName})`,
    `- [ ] Manual audit JSON updated to reflect the fix`,
    `- [ ] \`pnpm run test:storybook\` passes`,
    ``,
    `## References`,
    ``,
    `- [${issue.criterion} specification](https://www.w3.org/TR/WCAG22/)`,
    `- Audit data: \`a11y/reports/manual-audit-${issue.surface}.json\``,
    `- Pipeline docs: \`docs/a11y-compliance-pipeline.md\``,
  ].join('\n');
}

function buildGhCommand(issue: Issue): string {
  const title = `[a11y] ${issue.component}: ${issue.criterionName} (${issue.criterion})`;
  const body = buildIssueBody(issue);
  const labels = 'a11y';

  return [
    `gh issue create \\`,
    `  --repo "${REPO}" \\`,
    `  --title "${title.replace(/"/g, '\\"')}" \\`,
    `  --label "${labels}" \\`,
    `  --body "$(cat <<'ISSUE_EOF'`,
    body,
    `ISSUE_EOF`,
    `)"`,
  ].join('\n');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const jsonOutput = args.includes('--json');

  console.log(
    execute
      ? '🚀 EXECUTE MODE — Issues will be filed via gh CLI\n'
      : '🔍 DRY RUN — Showing issues that would be created. Pass --execute to file them.\n'
  );

  const reportFiles = await readdir(REPORTS_DIR);
  const allIssues: Issue[] = [];

  const violationsFiles = reportFiles.filter((f) =>
    VIOLATIONS_FILE_PATTERN.test(f)
  );

  for (const filename of violationsFiles) {
    const surface = extractSurface(filename);
    const filePath = path.join(REPORTS_DIR, filename);
    const issues = await extractFromViolationsFile(filePath, surface);
    allIssues.push(...issues);
  }

  const coveredSurfaces = new Set(
    violationsFiles.map((f) => extractSurface(f))
  );
  const auditFiles = reportFiles.filter(
    (f) =>
      AUDIT_FILE_PATTERN.test(f) &&
      !VIOLATIONS_FILE_PATTERN.test(f) &&
      !coveredSurfaces.has(extractSurface(f))
  );

  for (const filename of auditFiles) {
    const surface = extractSurface(filename);
    const filePath = path.join(REPORTS_DIR, filename);
    const issues = await extractFromAuditFile(filePath, surface);
    allIssues.push(...issues);
  }

  let deltaFiles: string[] = [];
  try {
    deltaFiles = (await readdir(DELTAS_DIR)).filter((f) =>
      DELTA_PATTERN.test(f)
    );
  } catch {
    // No deltas directory — skip
  }

  for (const filename of deltaFiles) {
    const filePath = path.join(DELTAS_DIR, filename);
    const issues = await extractFromDeltaFile(filePath);
    allIssues.push(...issues);
  }

  const deduplicated = deduplicateIssues(allIssues);

  if (deduplicated.length === 0) {
    console.log('✅ No violations found in audit data. Nothing to file.');
    return;
  }

  const byCriterion = new Map<string, Issue[]>();
  for (const issue of deduplicated) {
    const key = issue.criterion;
    if (!byCriterion.has(key)) {
      byCriterion.set(key, []);
    }
    byCriterion.get(key)!.push(issue);
  }

  console.log(
    `Found ${deduplicated.length} violations across ${byCriterion.size} WCAG criteria:\n`
  );

  for (const [criterion, issues] of byCriterion) {
    const name = issues[0].criterionName;
    const components = issues.map((i) => i.component).join(', ');
    console.log(`  ${criterion} (${name}): ${issues.length} component(s)`);
    console.log(`    → ${components}\n`);
  }

  if (jsonOutput) {
    console.log('\n--- JSON OUTPUT ---\n');
    console.log(JSON.stringify(deduplicated, null, 2));
    return;
  }

  console.log('\n--- GITHUB ISSUE COMMANDS ---\n');

  for (const issue of deduplicated) {
    const command = buildGhCommand(issue);

    if (execute) {
      const title = `[a11y] ${issue.component}: ${issue.criterionName} (${issue.criterion})`;
      console.log(`Filing: ${title}`);
      try {
        const body = buildIssueBody(issue);
        execSync(
          `gh issue create --repo "${REPO}" --title "${title.replace(/"/g, '\\"')}" --label "a11y" --body-file -`,
          {input: body, stdio: ['pipe', 'inherit', 'inherit']}
        );
        console.log(`  ✅ Created\n`);
      } catch {
        console.log(`  ❌ Failed — is gh CLI authenticated?\n`);
      }
    } else {
      console.log(command);
      console.log('');
    }
  }

  if (!execute) {
    console.log(
      `\n💡 To file these ${deduplicated.length} issues, run:\n   node a11y/scripts/generate-a11y-issues.mjs --execute\n`
    );
  }
}

main().catch((error) => {
  console.error('Failed to generate issues:', error);
  process.exit(1);
});
