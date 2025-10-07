# pnpm Migration Documentation

This directory contains comprehensive documentation and tools for migrating the ui-kit monorepo from npm to pnpm.

## Files in This Directory

### 1. `pnpm-migration.instructions.md` (Main Guide)
**Purpose:** Complete step-by-step migration plan with 11 phases

**Use this for:**
- Understanding the full scope of the migration
- Detailed explanations of each phase
- Risk assessments and time estimates
- Success criteria and validation steps

**Target audience:** LLM agents and developers executing the migration

### 2. `pnpm-migration-quick-reference.md` (Cheat Sheet)
**Purpose:** Quick lookup guide for common patterns and commands

**Use this for:**
- Quick npm → pnpm command mappings
- Common regex patterns for find/replace
- GitHub Actions templates
- Testing commands
- Troubleshooting common issues

**Target audience:** Anyone working on the migration who needs quick answers

### 3. `pnpm-migration-helper.mjs` (Automation Script)
**Purpose:** Automate repetitive find/replace operations

**Usage:**
```bash
# See what would be changed (safe)
node .github/instructions/pnpm-migration-helper.mjs --dry-run

# Apply the changes
node .github/instructions/pnpm-migration-helper.mjs --apply
```

**What it does:**
- Updates npm commands to pnpm in package.json scripts
- Updates npm commands in markdown documentation
- Replaces package-lock.json references with pnpm-lock.yaml
- Reports on special files that need manual attention

**⚠️ Important:** Always review changes with `git diff` before committing!

## Migration Workflow

### For LLM Agents

1. **Read** `pnpm-migration.instructions.md` - Start with Phase 1
2. **Reference** `pnpm-migration-quick-reference.md` as needed
3. **Execute** one phase at a time
4. **Test** after each phase using the validation commands
5. **Update** the status table in the instructions file
6. **Request human review** at the specified checkpoints

### For Human Supervisors

1. **Review** the main instructions file to understand scope
2. **Monitor** the status table to track progress
3. **Intervene** at the human supervision checkpoints:
   - Before Phase 4 (CI/CD) - High impact
   - Before Phase 5 (CI Utilities) - Critical for releases
   - Before Phase 10 (Testing) - Need human judgment
   - After Phase 10 - Before final merge
4. **Use** the quick reference for answering agent questions

## Phase Overview

| Phase | Name | Risk | Can Auto-Run |
|-------|------|------|--------------|
| 1 | Setup & Preparation | Low | ✅ Yes |
| 2 | Package Scripts | Medium | ⚠️ Partial* |
| 3 | Turbo Configuration | Low | ✅ Yes |
| 4 | CI/CD Workflows | High | ❌ No** |
| 5 | CI Utilities | Very High | ❌ No** |
| 6 | VS Code Config | Low | ✅ Yes |
| 7 | Scripts & Utilities | Medium | ⚠️ Partial* |
| 8 | Documentation | Low | ⚠️ Partial* |
| 9 | Package Patches | Medium | ✅ Yes |
| 10 | Testing & Validation | High | ❌ No** |
| 11 | Cleanup | Low | ✅ Yes |

\* Can use helper script + manual review  
\** Requires human review before execution

## Key Decision Points

### 1. When to Run the Helper Script?

**Recommended timing:**
- After completing Phase 1 (Setup)
- Before starting Phase 2 (Package Scripts)
- Run in `--dry-run` mode first to see impact
- Review all changes before applying

### 2. Testing Strategy

**After each phase:**
```bash
pnpm install                      # Should work without errors
pnpm run build                    # Should complete successfully
pnpm turbo build                  # Turborepo should work
```

**Before merging:**
- Full CI pipeline must pass
- All tests must pass
- Release process tested in staging environment

### 3. Rollback Plan

If critical issues arise, follow the emergency rollback procedure in the quick reference guide.

## Common Issues & Solutions

See the "Common Issues & Solutions" section in `pnpm-migration.instructions.md` for detailed troubleshooting.

Quick fixes:
- **Peer dependency warnings:** Add `auto-install-peers=true` to `.npmrc`
- **Hoisting issues:** Add `shamefully-hoist=true` or use `public-hoist-pattern`
- **CI cache not working:** Ensure pnpm setup comes before Node.js setup
- **Commands not found:** Check public-hoist-pattern in `.npmrc`

## Estimated Timeline

- **Full migration:** 35-53 hours of development time
- **With LLM agent:** Could be reduced to 20-30 hours of supervision time
- **Recommended approach:** 1-2 weeks with incremental phases

## Success Metrics

The migration is successful when:
1. ✅ All packages install without errors
2. ✅ Full build completes successfully
3. ✅ All tests pass
4. ✅ CI/CD pipeline works end-to-end
5. ✅ Release process validated
6. ✅ No npm artifacts remain
7. ✅ Team can work with new setup
8. ✅ Documentation is complete

## Getting Started

**For immediate action:**

1. Create a feature branch:
   ```bash
   git checkout -b chore/migrate-to-pnpm
   ```

2. Start with Phase 1:
   ```bash
   # Read the instructions
   cat .github/instructions/pnpm-migration.instructions.md | grep -A 50 "Phase 1"
   
   # Or open in your editor
   code .github/instructions/pnpm-migration.instructions.md
   ```

3. Create `pnpm-workspace.yaml` as specified in Phase 1.1

4. Run the helper script to see what would change:
   ```bash
   node .github/instructions/pnpm-migration-helper.mjs --dry-run
   ```

## Questions?

- **LLM agents:** Reference the main instructions file and quick reference
- **Humans:** Review the main instructions file, especially the "Common Issues" section
- **Stuck?:** Check the quick reference for the specific pattern you need
- **Emergency:** Use the rollback plan in the quick reference

## Status Tracking

Current migration status is tracked in the status table at the bottom of `pnpm-migration.instructions.md`.

Update this table as you complete each phase.

---

**Last Updated:** 2025-10-07  
**Documentation Version:** 1.0  
**Migration Status:** Ready to Begin
