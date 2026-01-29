# Areas Configuration

This directory contains configuration files for Repository Areas.

Each YAML file defines an "area" of the codebase and the review requirements for it.

**Example:**

```yaml
description: Human-readable description of this area
file_patterns:
  - "packages/example/**"

reviewers:
  team-slug:
    minimum_approvals: 1  # Blocking
  other-team:
    minimum_approvals: 0  # Request Only (Non-blocking)

review_bypass:
  trusted-team: pull_request  # Can bypass these rules
  integration/139346: exempt # Developer eXperience Bot. Important for releases
```

For full documentation on how this works and available options, see [`coveo/areas`](https://github.com/coveo/areas).
