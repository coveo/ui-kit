# Oxlint Integration Guide

This document provides a comprehensive guide for the oxlint integration in the UI Kit monorepo. Oxlint is a fast JavaScript/TypeScript linter that runs alongside ESLint to provide improved performance while maintaining code quality standards.

## Overview

Oxlint has been integrated as a complementary linter that runs before ESLint in our linting workflow. This setup provides:

- **60x performance improvement** (1.2s vs 24s for single package linting)
- **Maintained code quality** through ESLint compatibility
- **Package-specific configurations** tailored to different frameworks
- **Seamless CI/CD integration** with existing workflows

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm/yarn package manager
- Existing ESLint configuration

### Installation

Oxlint is installed as a development dependency:

```bash
npm install --save-dev oxlint
```

### Configuration Files

#### Root Configuration (`.oxlintrc.json`)

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": [],
  "categories": {
    "correctness": "warn",
    "suspicious": "off",
    "pedantic": "off"
  },
  "rules": {
    "eslint/no-unused-vars": "off",
    "eslint/prefer-const": "off",
    "eslint/no-var": "off"
  },
  "env": {
    "builtin": true
  },
  "ignorePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/stencil-generated/**",
    "**/*.d.ts"
  ]
}
```

#### Package-Specific Configurations

Each major package has its own `.oxlintrc.json` configuration:

- **`packages/atomic/.oxlintrc.json`** - Stencil web components (warn level for large codebase)
- **`packages/headless/.oxlintrc.json`** - Core business logic (strictest rules)
- **`packages/quantic/.oxlintrc.json`** - Salesforce LWC platform constraints
- **`packages/atomic-react/.oxlintrc.json`** - React-specific patterns
- **`packages/samples/.oxlintrc.json`** - Permissive rules for examples

## Integration Points

### 1. Package.json Scripts

The main linting scripts have been updated to run oxlint before ESLint:

```json
{
  "scripts": {
    "lint:check": "npx oxlint && eslint . && cspell \"**/*.{js,ts,tsx,md,json}\" && prettier --check .",
    "lint:fix": "npx oxlint --fix && eslint --fix . && prettier --write ."
  }
}
```

### 2. Pre-commit Hooks (lint-staged.config.js)

Oxlint runs automatically on staged files before commit:

```javascript
const filteredFiles = allStagedFiles.filter(file =>
  file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')
);

return [
  `npx oxlint --fix ${filteredFiles.join(' ')}`,
  `eslint --fix ${filteredFiles.join(' ')}`
];
```

### 3. ESLint Compatibility

The `.eslintrc.js` includes `eslint-plugin-oxlint` to prevent rule conflicts:

```javascript
module.exports = {
  extends: [
    // ...other extends
    'plugin:oxlint/recommended',
  ],
  // ...rest of config
};
```

## Package-Specific Configurations

### Atomic Package (Stencil Components)

- **Files**: 903 TypeScript files
- **Configuration**: Warn-level rules to handle large codebase
- **Specific rules**: Disabled max-lines-per-function for complex components

### Headless Package (Core Logic)

- **Files**: 1,417 TypeScript files
- **Configuration**: Strictest error-level rules
- **Focus**: Core business logic requires highest quality standards

### Quantic Package (Salesforce LWC)

- **Files**: 1,594 TypeScript files
- **Configuration**: Platform-specific constraints
- **Specific rules**: Salesforce development patterns and limitations

### Atomic React Package

- **Files**: 36 TypeScript files
- **Configuration**: React-specific linting patterns
- **Focus**: React component development best practices

### Samples Package

- **Files**: ~200 mixed files
- **Configuration**: Most permissive rules
- **Purpose**: Examples and demonstrations

## Performance Benefits

### Benchmark Results

- **Single package (atomic)**: oxlint 1.2s vs ESLint 24s (60x faster)
- **Full monorepo**: Significant reduction in CI/CD pipeline time
- **Developer experience**: Near-instant feedback during development

### Parallel Execution

Oxlint and ESLint run in sequence but complement each other:

1. Oxlint provides fast feedback on common issues
2. ESLint provides comprehensive rule coverage and custom rules
3. Combined approach maintains quality while improving speed

## Usage

### Command Line

```bash
# Run oxlint on all files
npx oxlint

# Run with auto-fix
npx oxlint --fix

# Run on specific files
npx oxlint src/**/*.ts

# Run with specific config
npx oxlint -c packages/atomic/.oxlintrc.json
```

### IDE Integration

Most modern editors support oxlint through:

- VS Code: Extensions available for real-time linting
- WebStorm: Built-in support for oxlint configurations
- Vim/Neovim: Language server protocol support

## Rule Categories

Oxlint organizes rules into categories with configurable severity levels:

- **correctness**: Catches bugs and logical errors (error level)
- **suspicious**: Identifies potentially problematic patterns (error level)
- **pedantic**: Style and best practice recommendations (warn level)
- **performance**: Performance-related optimizations (available but not enabled)
- **style**: Code formatting and style (handled by Prettier)

## Troubleshooting

### Common Issues

#### 1. Schema Validation Errors

**Problem**: IDE shows schema validation errors
**Solution**: Ensure all `.oxlintrc.json` files use correct schema path:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json"  // for root
  "$schema": "../../node_modules/oxlint/configuration_schema.json"  // for packages
}
```

#### 2. Rule Conflicts with ESLint

**Problem**: Same issues reported by both linters
**Solution**: Verify `eslint-plugin-oxlint` is properly configured in `.eslintrc.js`

#### 3. Performance Issues

**Problem**: Oxlint running slower than expected
**Solution**: Check ignore patterns and ensure large directories are excluded

#### 4. Configuration Not Found

**Problem**: Oxlint not using package-specific config
**Solution**: Verify `.oxlintrc.json` exists in package directory and has correct syntax

### Debug Commands

```bash
# Check oxlint version
npx oxlint --version

# Validate configuration
npx oxlint --print-config

# Run with verbose output
npx oxlint --debug
```

## Best Practices

### 1. Configuration Management

- Use local schema references for offline support
- Keep package configs focused and minimal
- Regularly update rule categories based on team feedback

### 2. Rule Severity

- Use `error` for correctness and security issues
- Use `warn` for style and best practices
- Use `off` only when necessary for framework constraints

### 3. Performance Optimization

- Maintain comprehensive ignore patterns
- Use package-specific configs to avoid unnecessary processing
- Monitor CI/CD pipeline times regularly

### 4. Team Adoption

- Document any package-specific rule decisions
- Provide clear migration guides for developers
- Regular team reviews of linting effectiveness

## Migration Notes

### From Pure ESLint

1. Existing ESLint rules remain active
2. Oxlint runs first to catch obvious issues quickly
3. Gradual adoption possible through warn-level rules

### Configuration Evolution

- Started with root-only configuration
- Added package-specific configs based on codebase analysis
- Refined rules based on team feedback and CI performance

## ESLint Migration Plan

### Goal: Better DX with Faster Linting

**Current**: oxlint (1.2s) + ESLint (24s) = 25.2s  
**Target**: oxlint-only (1.2s) = **95% faster**

### High-Level Migration Tasks

#### 1. Enhance Oxlint Rule Coverage

```json
// Update .oxlintrc.json to enable more categories
{
  "categories": {
    "correctness": "error", // ✅ Already enabled
    "suspicious": "error", // 🔄 Enable (currently off)
    "pedantic": "warn" // 🔄 Enable (currently off)
  }
}
```

#### 2. Package-by-Package Migration

**Migration order** (complexity-based):

- Start with simpler packages: `bueno`, `auth`, `atomic-react`
- Progress to core packages: `headless`, `atomic`, `quantic`

**Per package tasks**:

- Test oxlint coverage and rule effectiveness
- Remove package-specific `.eslintrc.json` files
- Update package scripts to use oxlint-only
- Validate no quality regression

#### 3. Handle Specialized ESLint Functionality

- **Spell checking**: Move from `@cspell/eslint-plugin` to direct `cspell` usage
- **Package-lock validation**: Replace with custom scripts if needed
- **TypeScript rules**: Ensure oxlint covers critical type safety patterns

#### 4. Root Configuration Cleanup

- Remove root `.eslintrc.js` configuration
- Uninstall ESLint dependencies: `eslint`, `@typescript-eslint/*`, `gts`
- Update root package.json scripts to be oxlint-only
- Update lint-staged configuration

### Expected Benefits

- **95% faster linting** (1.2s vs 25s)
- **Faster pre-commit hooks** (<5s vs 30s)
- **Better IDE performance**
- **Simpler configuration** (one linter instead of two)

### Quick Start

```bash
# Start with easiest package
cd packages/bueno
npx oxlint .
# If no major issues, remove .eslintrc.json
```

## Post-Merge Action Items

### Immediate Monitoring & Validation

- [ ] **Monitor CI/CD performance** for stability post-merge
- [ ] **Collect developer feedback** on pre-commit hook experience
- [ ] **Validate all package builds** pass with new linting setup
- [ ] **Document actual performance improvements** achieved

### Team Communication & Adoption

- [ ] **Announce integration** to development teams
- [ ] **Share documentation** and usage guidelines
- [ ] **Create IDE setup guides** for VS Code, WebStorm, etc.
- [ ] **Schedule team demo** of performance benefits

### Configuration Optimization

- [ ] **Analyze oxlint warnings** across all packages
- [ ] **Fine-tune rule severity** based on real usage patterns
- [ ] **Optimize ignore patterns** to reduce unnecessary processing
- [ ] **Review package-specific configs** for effectiveness

### Success Metrics

- **Performance**: Target 40-50% build time reduction
- **Quality**: Maintain code quality while improving speed
- **Adoption**: >80% developer satisfaction rate
- **Workflow**: <5 second pre-commit hooks

## Future Considerations

### Potential Improvements

- **Custom rules**: Develop organization-specific oxlint rules
- **CI optimization**: Further pipeline performance improvements
- **IDE extensions**: Enhanced editor integration
- **Complete ESLint removal**: Achieve single-linter setup for maximum performance

### Monitoring & Maintenance

- Track CI/CD performance metrics before/after integration
- Monitor developer feedback on linting experience
- Regular review of rule effectiveness and coverage
- Quarterly assessment of ESLint migration progress

### Risk Mitigation

- **Performance regression**: Monitor for unexpected slowdowns
- **Rule conflicts**: Maintain comprehensive conflict detection
- **Team adoption**: Address resistance through training and support
- **Quality assurance**: Ensure no regression in caught issues

## Support & Resources

## Support & Resources

### Team Communication

- Use team Slack channels for oxlint discussions
- Schedule regular tech talks on code quality improvements
- Create feedback channels for configuration suggestions

### Internal Resources

- This comprehensive integration guide
- Team knowledge sharing sessions
- Regular performance reviews and optimizations

### External Resources

- [Oxlint Official Documentation](https://oxc-project.github.io/docs/guide/usage/linter.html)
- [Oxlint GitHub Repository](https://github.com/oxc-project/oxc)
- [ESLint Plugin Oxlint](https://github.com/oxc-project/eslint-plugin-oxlint)

---

**Last Updated**: June 17, 2025  
**Version**: 1.1.0  
**Contributors**: Development Team

## Updated Jira Ticket Summary/Comment

**Summary of Findings**

The project is currently using ESLint 8.57.1 with over 23 .eslintrc.\* files spread across packages. The setup is well-integrated with CI/CD (GitHub Actions) and pre-commit hooks (lint-staged). Rule violations are rare, and the team seems comfortable with the current linting approach.

There are some custom ESLint plugins in use, notably eslint-plugin-canonical (v4.18.0, patched for monorepo compatibility).

A security scan revealed 50 npm vulnerabilities (4 low, 30 moderate, 16 high). While not directly related to linting, this is worth addressing during dependency updates.

**Key Issues**

- TypeScript compatibility warning: TypeScript 5.8.3 is in use, but the current @typescript-eslint only supports <5.6.0.
- There's a lot of duplication in ESLint configs (about 50% redundancy).
- Performance bottlenecks with large-scale linting operations across the monorepo.
- The legacy config format is holding back adoption of modern tooling.
- Security vulnerabilities in dependencies should be addressed as part of any upgrade.

**Recommended Approach: oxlint Integration**

After evaluating ESLint 9 migration and Biome adoption, **oxlint emerges as the optimal solution** for this project:

- **Performance**: 50-100x faster than ESLint, critical for large monorepos
- **Compatibility**: Works alongside existing ESLint setup during transition
- **TypeScript-first**: Built for modern TypeScript/JavaScript projects
- **Low Risk**: Can be adopted incrementally without breaking existing workflows

**Why Not ESLint 9 or Biome?**

- **ESLint 9**: While beneficial, the migration complexity and performance gains are limited compared to oxlint
- **Biome**: Doesn't support Stencil (custom JSX pragma), Salesforce LWC, or custom plugins. Only ~30% of codebase could migrate

**Actionable Steps**

1. **Phase 1**: Integrate oxlint alongside ESLint (already implemented)
2. **Phase 2**: Gradually migrate packages to oxlint-only linting
3. **Phase 3**: Deprecate ESLint configs where oxlint provides equivalent coverage
4. **Phase 4**: Full migration to oxlint with ESLint only for specialized rules

**Next Steps**

Start with oxlint performance testing across packages and team training. Proceed with phased migration while maintaining strong CI and developer experience throughout.

**Migrating to oxlint will modernize linting, dramatically improve performance, reduce CI times, and provide a better developer experience while maintaining compatibility with existing tooling.**

---

**Last Updated**: June 17, 2025  
**Version**: 1.1.0  
**Contributors**: Development Team
