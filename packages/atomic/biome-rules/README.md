# Biome toLocaleString Plugin

Enforces explicit locale usage in `toLocaleString()` calls.

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

# Or use pnpm script
pnpm run lint:check
```

The plugin runs automatically as part of the existing lint process and will fail CI if violations are found.
