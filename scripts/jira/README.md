# Jira Sprint Sync

This directory contains the automation script for syncing Jira sprint issues to GitHub issues.

## Overview

The sync automation helps enhance developer productivity by automatically creating GitHub issues for all tasks in the active Jira sprint. This enables better use of GitHub Copilot Coding Agent and keeps development work visible in the GitHub repository.

## How It Works

1. **Scheduled Execution**: The workflow runs weekly on Mondays at 9:00 AM UTC
2. **Manual Trigger**: Can also be triggered manually via GitHub Actions UI
3. **Jira API Integration**: Fetches issues from the current active sprint
4. **Issue Synchronization**: 
   - Creates new GitHub issues for Jira issues that don't exist yet
   - Updates existing GitHub issues if they're already synced
   - Uses the Jira issue key (e.g., `KIT-123`) to track and prevent duplicates

## GitHub Issue Format

Synced issues follow this format:

**Title**: `[JIRA-KEY] Original Jira Issue Title`

**Labels**: `jira`, `automation`

**Description**:
```markdown
<!-- Jira Key: JIRA-KEY -->

🔗 **Jira Issue:** [JIRA-KEY](https://jira-url/browse/JIRA-KEY)

**Type:** Task
**Status:** In Progress
**Priority:** High

---

## Description

[Original Jira description]

**Assignee:** John Doe
```

## Required Secrets

The following secrets must be configured in the repository (Environment: `Jira Sync`):

- `JIRA_BASE_URL`: Your Jira instance URL (e.g., `https://coveord.atlassian.net`)
- `JIRA_EMAIL`: Email address for Jira API authentication
- `JIRA_API_TOKEN`: Jira API token (generate from [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens))
- `GH_APP_ID`: GitHub App ID (already configured)
- `GH_APP_PRIVATE_KEY`: GitHub App private key (already configured)

## Manual Execution

To run the sync manually:

1. Go to GitHub Actions tab
2. Select "Sync Jira Sprint Issues" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Local Development & Testing

You can test the script locally:

```bash
# Set environment variables
export JIRA_BASE_URL="https://coveord.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-jira-api-token"
export GITHUB_TOKEN="your-github-token"
export GITHUB_REPOSITORY="coveo/ui-kit"

# Run the script
node scripts/jira/sync-sprint-issues.mjs
```

⚠️ **Warning**: Running locally will create real issues in the repository. Consider testing against a test repository first.

## Limitations & Future Enhancements

### Current Limitations
- Only syncs issues from the first board found in Jira
- Only syncs the first active sprint
- One-way sync (Jira → GitHub only)
- Does not automatically close GitHub issues when Jira issues are completed

### Planned Enhancements
- Bidirectional sync (update Jira from GitHub)
- Automatic issue closure when Jira issues are marked as Done
- Link PRs to both Jira and GitHub issues automatically
- Support for multiple boards/sprints
- Comment synchronization

## Troubleshooting

### Workflow fails with authentication error
- Verify that all required secrets are configured correctly
- Check that the Jira API token is still valid
- Ensure the GitHub App has `issues: write` permission

### No issues are synced
- Verify that there is an active sprint in Jira
- Check that the Jira board is accessible with the provided credentials
- Review the workflow logs for specific error messages

### Duplicate issues created
- The script uses the Jira key in the issue title to track duplicates
- Ensure existing synced issues have the format `[JIRA-KEY] ...` in their title
- Check that synced issues have the `jira` label

## Support

For issues or questions about the Jira sync automation, please contact the DevEx team or create an issue in this repository.
