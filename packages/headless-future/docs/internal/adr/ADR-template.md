# Short, action-oriented decision title

**Status**: Proposed | Accepted | Rejected | Superseded
**Related docs**: RFCs, issues, PRs, design docs

## 1. Context

Describe the problem, constraints, and why a decision is needed now.

- Business/context drivers:
- Technical constraints:
- Known assumptions:
- Non-goals:

## 2. Decision Statement

State the decision in one clear paragraph.

## 3. Requirements Mapping

Map this decision to headless-future's Architecture Decision Charter requirements.

### MUST

1. Requirement: **Full use-case support**

- Impact:
- How satisfied:

2. Requirement: **Public API independence**

- Impact:
- How satisfied:

3. Requirement: **First-class SSR**

- Impact:
- How satisfied:

### SHOULD

1. Requirement: **Migration simplicity**

- Impact:
- How addressed (or why deferred):

2. Requirement: **Tree-shaking efficiency**

- Impact:
- How addressed (or why deferred):

3. Requirement: **External contribution readiness**

- Impact:
- How addressed (or why deferred):

## 4. Options Considered

### Option A (Selected): Name

- Summary:
- Pros:
- Cons:
- Risks:

### Option B: Name

- Summary:
- Pros:
- Cons:
- Risks:

### Option C: Name (if needed)

- Summary:
- Pros:
- Cons:
- Risks:

## 5. Decision Rationale

Explain why the selected option is best, including key tradeoffs and why rejected options were not chosen.

## 6. Public API and Contract Impact

- Public API changes: None | Yes (describe)
- Backward compatibility impact:
- Deprecations required:
- Type/contract stability notes:
- Non-leakage check (implementation details not exposed): Pass | Fail

## 7. Operational and Runtime Impact

- Performance impact:
- Reliability impact:
- Security/privacy impact:
- SSR impact (if applicable):
- Observability impact (logs/metrics/traces):

## 8. Migration and Rollout Plan

- Consumer migration impact:
- Rollout strategy (flagged, phased, big-bang):
- Rollback strategy:
- Communication plan:

## 9. Validation Plan (Acceptance Gates)

Define objective pass/fail checks.

1. **API gate**:

- Check:
- Owner:
- Pass criteria:

2. **Coverage gate**:

- Check:
- Owner:
- Pass criteria:

3. **SSR gate (if applicable)**:

- Check:
- Owner:
- Pass criteria:

4. **Bundle/tree-shaking gate (if applicable)**:

- Check:
- Owner:
- Pass criteria:

## 10. Risks and Mitigations

| Risk   | Likelihood   | Impact       | Mitigation | Owner |
| ------ | ------------ | ------------ | ---------- | ----- |
| Risk 1 | Low/Med/High | Low/Med/High | Mitigation | Name  |

## 11. Follow-up Actions

| Action   | Priority | Owner | Target Date | Tracking Link |
| -------- | -------- | ----- | ----------- | ------------- |
| Action 1 | P0/P1/P2 | Name  | YYYY-MM-DD  | Link          |

## 12. Revisit Criteria

Define when this ADR must be reviewed again.

- **Trigger events**:
- **Sunset/review date**:
- **Success signals**:
- **Failure signals**:

## 13. Decision Outcome

- **Final status**:
- **Approver(s)**:
- **Approval date**:
