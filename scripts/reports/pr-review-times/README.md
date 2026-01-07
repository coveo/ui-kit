# PR Review Time Analysis Tools

A suite of vibe-coded scripts to fetch, analyze, and report on Pull Request review performance and collaboration patterns in the `coveo/ui-kit` repository.

## Intent

The primary goal of this toolset is to provide visibility into the code review process. It helps answer questions like:
- How long does it take for different teams to Pick Up and Approve PRs?
- How much "cross-team" collaboration is happening?
- Are we improving over time?

By distinguishing between **Business Days** and calendar days, and filtering out holidays, the metrics aim to be fair and accurate representations of team responsiveness.

## Design Choices

### 1. Modular Architecture
The logic is split into distinct modules to separate concerns:
- **`index.mjs`**: The CLI entry point that orchestrates the workflow.
- **`fetch-pr.mjs`**: Fetches raw data from GitHub and performs per-PR analysis (calculating durations, identifying teams).
- **`aggregate.mjs`**: Consolidates analyzed PRs into high-level metrics (averages, medians, percentiles) and generates reports (JSON, CSV, Console).
- **`holidays.mjs`**: Contains the logic for "Business Days". It ignores weekends and fixed/moving holidays (New Year's, Patriot's Day, etc.) to calculate accurate durations.
- **`codeowners.mjs`**: Parses the repository's `CODEOWNERS` file to map files to teams.

### 2. Local Caching & Differential Updates
Github API rate limits can be a bottleneck. The script uses a local filesystem cache (`data/*.json`):
- When running `fetch`, the script checks the `updated_at` timestamp of the PR.
- It only re-fetches data from GitHub if the PR has changed since the last run.
- This allows for fast incremental updates and offline reporting.

### 3. Identifying Cross-Team PRs

A PR is determined to be cross-team if a review is requested from more than one team.

A [GitHub action](../../../.github/workflows/label-cross-team.yml) automatically adds a `cross-team` label for easier filtering.

PRs created after November 1st 2025 were [backfilled](backfill-label.mjs).

### 4. Author Confidence

The report distinguishes between:

- `high-confidence`: The system is blocking from merging due to CODEOWNERS, but the author rather confident about the change and thinks they should be able to merge without an additional review.
- `low-confidence`: The author is not that confident and actually wants another team to review the change before merging.

### 5. Metrics
All duration metrics are reported in **Business Days (8h)**.
- **Pickup Time**: Time from "Ready for Review" -> First Review or Comment.
- **Review Time**: Time from First Review -> Approval.
- **Total Time**: Time from "Ready for Review" -> Merge.


## Prerequisites
- Node.js environment.
- `GITHUB_TOKEN` environment variable with read access to the repository.

## Usage

From this directory, run `./run.sh`. Look into [the script](run.sh) for details.

Outputs:
- **Console Summary**: A text-based overview.
- **`aggregated.json`**: Full dataset for external analysis.
- **`aggregated.csv`**: Flatted data for spreadsheet import.

## Example Console Output

```
=========================================
   PR Review Aggregation Summary
   (Values in Business Days)
=========================================

Global Stats:
  Reviewed: count=5 / avg=3.23 / p95=6.89
  Pending:  count=15 / avg=3.73 / p95=9.98

-----------------------------------------
By Team (Sorted by Volume)
-----------------------------------------

@coveo/dxui
  Aggregated (count=33):
    Reviewed: count=10 / avg=2.71 / p95=6.86
    Pending:  count=12 / avg=4.1 / p95=9.98

  High Confidence (count=6):
    Reviewed: count=4 / avg=2.94 / p95=5.1
    Pending:  count=2 / avg=3.16 / p95=3.22

  Low Confidence (count=2):
    Pending:  count=2 / avg=2.16 / p95=4.14

@coveo/dx
  Aggregated (count=15):
    Reviewed: count=6 / avg=1.99 / p95=5.78
    Pending:  count=4 / avg=3.51 / p95=8.16

  Low Confidence (count=1):
    Reviewed: count=1 / avg=0 / p95=0
```
