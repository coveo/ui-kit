# GitHub to Jira Sync Workflow

This workflow automatically syncs GitHub Issues from the [DXUI Project Board](https://github.com/orgs/coveo/projects/21) to the [KIT Jira Project](https://coveord.atlassian.net/jira/software/c/projects/KIT/).

## Overview

The workflow runs daily at 00:00 UTC and:
1. Queries all issues in the GitHub project board (coveo/21)
2. For each issue:
   - Checks if a corresponding Jira issue exists (by searching for the GitHub issue number)
   - Creates a new Jira issue if it doesn't exist
   - Updates the existing Jira issue if it does exist
3. Includes the GitHub issue URL in the Jira issue description
4. Applies labels from GitHub to Jira

## Setup

### Required Secrets

The workflow requires the following GitHub secrets to be configured in the repository settings:

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `JIRA_BASE_URL` | Base URL of the Jira instance | `https://coveord.atlassian.net` |
| `JIRA_USER_EMAIL` | Email address of the Jira user | The email of a service account or user with access to create/update issues in the KIT project |
| `JIRA_API_TOKEN` | Jira API token for authentication | Generate at https://id.atlassian.com/manage-profile/security/api-tokens |

### Optional: GitHub Personal Access Token (PAT)

If the workflow fails with permission errors when querying the project board, you may need to create a Personal Access Token:

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `PROJECT_PAT` | GitHub PAT with project read access | Generate at https://github.com/settings/tokens with `read:project` scope, then uncomment the PAT line in the workflow file |

The default `GITHUB_TOKEN` should work for most cases, but organization projects may require additional permissions.

### Setting up Jira API Token

1. Log in to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a descriptive name (e.g., "GitHub Sync Workflow")
4. Copy the generated token
5. Add it as a secret in the GitHub repository

### Configuring GitHub Secrets

1. Go to the repository settings: https://github.com/coveo/ui-kit/settings/secrets/actions
2. Click "New repository secret"
3. Add each of the required secrets mentioned above

## Manual Triggering

The workflow can be manually triggered from the GitHub Actions interface:
1. Navigate to [Actions](https://github.com/coveo/ui-kit/actions)
2. Select "Sync GitHub Issues to Jira" workflow
3. Click "Run workflow"

## Issue Mapping

### GitHub → Jira Field Mapping

- **Summary**: `[GH-{number}] {GitHub Issue Title}`
- **Description**: GitHub issue body + link to the GitHub issue
- **Issue Type**: Task
- **Labels**: All GitHub labels + `github-issue-{number}` label
- **Project**: KIT

### Identifying Synced Issues

Jira issues created by this workflow:
- Have a summary prefixed with `[GH-{number}]` where number is the GitHub issue number
- Include a `github-issue-{number}` label
- Have a link to the GitHub issue in the description

## Troubleshooting

### Workflow fails with "Resource not accessible by integration" error
- This error indicates that `GITHUB_TOKEN` doesn't have sufficient permissions to read organization project data
- Solution: Create a Personal Access Token (PAT) with `read:project` scope:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token" → "Generate new token (classic)"
  3. Give it a descriptive name (e.g., "Project Board Sync")
  4. Select the `read:project` scope
  5. Generate and copy the token
  6. Add it as a secret named `PROJECT_PAT` in the repository
  7. In the workflow file, change line 43 from `github-token: ${{ secrets.GITHUB_TOKEN }}` to `github-token: ${{ secrets.PROJECT_PAT }}`

### Workflow fails with authentication error
- Verify that all three Jira secrets are correctly set
- Verify that the Jira API token is valid and hasn't expired
- Verify that the user associated with the API token has permissions to create/update issues in the KIT project

### Issues not syncing
- Check the workflow logs in GitHub Actions for error messages
- Verify that the issues are actually in the GitHub project board (coveo/21)
- Check if the GitHub API rate limit has been exceeded

### Jira API errors
- Review the error messages in the workflow logs
- Common issues:
  - Invalid issue type (verify "Task" issue type exists in the KIT project)
  - Missing required fields in the Jira project
  - Permission issues

## Customization

### Changing the Schedule

To modify when the workflow runs, edit the cron expression in `.github/workflows/sync-github-to-jira.yml`:

```yaml
schedule:
  - cron: '0 0 * * *'  # Currently: Daily at 00:00 UTC
```

Common schedules:
- Every 6 hours: `0 */6 * * *`
- Twice daily: `0 0,12 * * *`
- Weekly on Monday: `0 0 * * 1`

### Changing the Issue Type

To use a different Jira issue type, modify the `issuetype` field in the workflow:

```javascript
issuetype: { name: 'Task' }  // Change 'Task' to 'Story', 'Bug', etc.
```

## Limitations

- The workflow currently processes up to 100 issues from the GitHub project (first page)
- There is a 1-second delay between processing each issue to avoid rate limiting
- The workflow uses the GitHub issue body as-is; complex formatting may not translate perfectly to Jira

## Future Improvements

Potential enhancements:
- Pagination support for projects with more than 100 issues
- Bi-directional sync (update GitHub when Jira changes)
- Custom field mapping
- Assignee synchronization
- Status synchronization based on GitHub issue state
- Comment synchronization
