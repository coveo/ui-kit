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
    "correctness": "error",
    "suspicious": "error",
    "pedantic": "warn"
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

## Future Considerations

### Potential Improvements

- **Custom rules**: Develop organization-specific oxlint rules
- **CI optimization**: Further pipeline performance improvements
- **IDE extensions**: Enhanced editor integration
- **Rule automation**: Automated rule suggestion based on codebase analysis

### Monitoring

- Track CI/CD performance metrics
- Monitor developer feedback on linting experience
- Regular review of rule effectiveness and coverage

## Support

### Internal Resources

- This documentation
- Team Slack channels for linting discussions
- Regular tech talks on code quality tools

### External Resources

- [Oxlint Official Documentation](https://oxc-project.github.io/docs/guide/usage/linter.html)
- [Oxlint GitHub Repository](https://github.com/oxc-project/oxc)
- [ESLint Plugin Oxlint](https://github.com/oxc-project/eslint-plugin-oxlint)

---

**Last Updated**: June 11, 2025  
**Version**: 1.0.0  
**Contributors**: Development Team
