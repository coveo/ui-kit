# Biome toLocaleString Plugin Implementation

## Overview
This implementation adds a custom Biome (GritQL) plugin that enforces explicit locale usage in `toLocaleString()` calls within the Atomic package. The plugin helps ensure consistent localization by requiring developers to explicitly pass locale arguments instead of relying on runtime browser locale.

## Files Created/Modified

### 1. Plugin File
**Location**: `/packages/atomic/biome-rules/no-tolocalestring-without-locale.grit`

```grit
// Biome GritQL plugin to enforce explicit locale usage in toLocaleString() calls
// This rule prevents usage of toLocaleString() without explicit locale argument
// to ensure consistent localization using Atomic's state instead of runtime locale

`$obj.toLocaleString()` where {
    register_diagnostic(
        span = $obj,
        message = "Use explicit locale argument: toLocaleString(locale). Get locale from Atomic i18n state to ensure consistent localization."
    )
}
```

### 2. Root Configuration
**Location**: `/biome.json`

Added to the root configuration:
```json
{
  "plugins": [
    "./packages/atomic/biome-rules/no-tolocalestring-without-locale.grit"
  ]
}
```

### 3. Package Configuration  
**Location**: `/packages/atomic/biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.6/schema.json",
  "extends": "//",
  "plugins": ["./biome-rules/no-tolocalestring-without-locale.grit"]
}
```

### 4. Test File
**Location**: `/packages/atomic/src/utils/test-plugin-tolocalestring.ts`

Comprehensive test file with examples of:
- ❌ Cases that should be flagged (no locale argument)
- ✅ Cases that should pass (with locale argument)
- Various usage patterns (functions, classes, arrow functions, etc.)

## How It Works

### Plugin Behavior
- **Detects**: All calls to `.toLocaleString()` without any arguments
- **Allows**: Calls with explicit locale arguments (string literals, variables, expressions)
- **Message**: "Use explicit locale argument: toLocaleString(locale). Get locale from Atomic i18n state to ensure consistent localization."

### Examples

**❌ Flagged (violations)**:
```typescript
price.toLocaleString();                    // Error
date.toLocaleString();                     // Error
(123.45).toLocaleString();                // Error
amount.toLocaleString();                   // Error
```

**✅ Allowed (correct usage)**:
```typescript
price.toLocaleString('en-US');             // OK
date.toLocaleString(locale);               // OK  
price.toLocaleString('en-US', options);    // OK
amount.toLocaleString(atomicLocale);       // OK
```

## Usage

### Running the Linter
```bash
# From root directory
npm run lint:check

# Or directly with Biome
npx @biomejs/biome lint packages/atomic/

# Check specific file  
npx @biomejs/biome lint packages/atomic/src/utils/test-plugin-tolocalestring.ts
```

### Integration with CI/CD
The plugin automatically runs as part of the existing lint check process and will fail the build if violations are found.

## Limitations

### Current Scoping
- **Global Application**: The plugin currently applies globally to all files processed by Biome
- **Intended Scope**: Should ideally only apply to the Atomic package
- **Workaround**: Place the plugin reference in both root and package configs, rely on team convention to only use this pattern in Atomic package

### Technical Constraints
- Biome's current plugin system doesn't support path-based scoping via overrides
- GritQL file-based filtering functions are not yet fully supported in Biome
- Plugin configuration is global rather than package-specific

## Future Improvements

1. **Path Scoping**: When Biome supports path-based plugin scoping, update to only apply to `packages/atomic/**`
2. **Enhanced Pattern Matching**: Add more sophisticated patterns to catch edge cases
3. **Auto-fix**: Potentially add suggestions for common locale patterns used in Atomic

## Testing

The implementation includes comprehensive test cases covering:
- Basic number and date formatting
- Method chaining scenarios  
- Class methods and arrow functions
- Valid usage patterns that should not be flagged
- Property access vs method calls distinction

Run tests with:
```bash
npx @biomejs/biome lint packages/atomic/src/utils/test-plugin-tolocalestring.ts
```

This should show 9 errors corresponding to the intentionally problematic code patterns marked with "❌ Should be flagged" comments.