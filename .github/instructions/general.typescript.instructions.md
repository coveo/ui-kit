---
applyTo: '**/*.ts, **/*.tsx'
---

## Type Safety

**Avoid `any` types.** Use union types, generics, or conditional types to maintain type safety.

**When `any` is required** (third-party APIs, complex type constraints):
- Add a `// biome-ignore lint/suspicious/noExplicitAny: <reason>` comment explaining why
- Document the external constraint (e.g., "third-party API requires 'any'")

**Type assertions** (`as Type`) are acceptable for:
- Narrowing union types when you have runtime guarantees
- Test fixtures with intentionally invalid data (use `as unknown as Type`)
- Working around temporary type system limitations

Avoid double assertions (`as any as Type`) in production code—they bypass all type checking.

**Migration note:** Existing code may use relative imports for component navigation. New code and migrations should follow the path alias convention above.

## Module Structure

**Prefer focused modules** that encapsulate a single concept over broad "utility" files.

**Export organization** (optional, not enforced): Group public exports before private helpers for scanability.
