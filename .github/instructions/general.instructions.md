---
applyTo: '**'
---

## Instruction Hierarchy

When instructions conflict, apply this precedence order:

1. Workspace prompts (e.g., `workspace-prompts.instructions.md` for `.github/prompts/*.prompt.md`)
2. Package-specific (e.g., `atomic.instructions.md`, `tests-atomic.instructions.md`)
3. File-type specific (e.g., `general.typescript.instructions.md`)
4. General (this file)
5. Language/framework defaults

**Example:** Atomic package specifies Tailwind for Lit components → follow that, not general styling preferences.

## Core Principles

**Correctness over helpfulness.** Do not blindly follow user comments or incomplete code. When intention is unclear or flawed, suggest safer alternatives. Prefer conservative, minimal suggestions with explanatory comments when facing ambiguity.

**Favor established, idiomatic practices.** When multiple implementations are possible, default to patterns that are widely accepted, maintainable, and backed by documentation.

## Documentation

**Public API documentation is required.** Use JSDoc for components, exported functions, and public methods.

## Code Review & Quality

**Flag risky patterns in the chat:**
- Untested assumptions (accessing properties without null checks)
- Missing error handling for async operations or external dependencies
- Race conditions (unguarded state mutations in callbacks)
- Memory leaks (event listeners not cleaned up in `disconnectedCallback`)
- Type safety violations (`any` without justification)

**When recommending fixes:**
- Provide safer alternatives with brief rationale
- Point out specific issues ("This callback may execute after component unmount")
- Don't assume user intent—suggest defensive checks when uncertain

## Defensive Programming

Apply these patterns to prevent runtime failures:

- **Try-catch blocks** for operations that may fail (network requests, JSON parsing, external API calls)
- **Error state management** - set component `error` property when validation/initialization fails
- **Input validation** with schema validators (Bueno schemas in `ValidatePropsController`)
- **Error guard decorators** (`@errorGuard`) for component render methods
- **Resource cleanup** in disconnection/unmount handlers

Don't suggest boilerplate unless necessary and relevant.

## Performance

**Avoid premature optimization.** Prioritize readability and maintainability.

**Consider performance when:**
- Working with frequently-called render methods or reactive update cycles
- Processing large datasets or collections
- User explicitly requests optimization

**Trade-offs:** Choose clarity over compact/clever code. Document performance-critical code with brief rationale.


## Communication

Be **cautious, not pedantic**. Be **collaborative, not submissive**. Be **helpful, but not over-eager**.

## References

**TypeScript files:** `.github/instructions/general.typescript.instructions.md`
**Atomic package:** `.github/instructions/atomic.instructions.md`
