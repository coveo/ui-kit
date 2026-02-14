# Problems — PR 7116 Decomposition

Unresolved blockers and open questions.

---

## [2026-02-14T10:06:00Z] Task 6/7: Incomplete - Build Failures

### Issues Found After Refactoring

**Build Errors in vitest-a11y-reporter.ts:**
- Line 305: 'wcagLevel' does not exist in type 'A11yCriterionReport'
- Line 326: 'criteria' does not exist in type 'A11yAutomatedResults'
- Line 333: 'date' does not exist in type 'A11yAutomatedResults'
- Line 338: 'automationCoveragePercentage' does not exist in type 'A11ySummary'
- Line 350/359: 'metadata' does not exist in type 'A11yReport'

**Test Failures:**
- 1 integration test failing in vitest-a11y-reporter.spec.ts (buildReport returns null)
- 37/38 tests passing

### Root Cause

The extraction process moved types to shared/types.ts but the vitest-a11y-reporter.ts implementation still references old properties that don't match the new type definitions. The types were likely cleaned up during extraction but the implementation wasn't fully updated.

### Recommendation

The core file structure refactoring (Tasks 1-5) is complete and committed:
- 18 new modules created
- json-to-openacr.ts reduced from 1465 to 137 lines ✓
- Scripts converted to TypeScript ✓
- Zero duplication achieved ✓

However, Tasks 6-7 revealed that the runtime implementation needs fixes to match the extracted type definitions.
