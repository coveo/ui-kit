# Biome toLocaleString Plugin

## Overview
Custom Biome (GritQL) plugin that enforces explicit locale usage in `toLocaleString()` calls. Ensures consistent localization by requiring developers to use Atomic's i18n state instead of relying on runtime browser locale.

## Plugin Rule
**File**: `no-tolocalestring-without-locale.grit`

Flags any `.toLocaleString()` calls without arguments and suggests using explicit locale from Atomic's i18n state.

## Configuration
Added to both root `biome.json` and `packages/atomic/biome.json`:
```json
{
  "plugins": ["./packages/atomic/biome-rules/no-tolocalestring-without-locale.grit"]
}
```

## Examples

**❌ Flagged (violations)**:
```typescript
price.toLocaleString();                    // Error
date.toLocaleString();                     // Error
(123.45).toLocaleString();                // Error
```

**✅ Allowed (correct usage)**:
```typescript
price.toLocaleString('en-US');             // OK
date.toLocaleString(locale);               // OK  
price.toLocaleString('en-US', options);    // OK
amount.toLocaleString(atomicLocale);       // OK
```

## Usage
```bash
# Check with Biome
npx @biomejs/biome lint packages/atomic/

# Or use npm script
npm run lint:check
```

The plugin runs automatically as part of the existing lint process and will fail CI if violations are found.

## Notes

- **Current Scope**: Plugin applies globally but intended for Atomic package only
- **Message**: "Use explicit locale argument: toLocaleString(locale). Get locale from Atomic i18n state to ensure consistent localization."
- **Integration**: Runs automatically with existing lint process and CI checks