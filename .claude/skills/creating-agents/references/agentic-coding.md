# Agentic Coding Patterns

Best practices for agents that read, write, and modify code.

## Code Exploration

**Investigate before answering:**
```xml
<code_exploration>
Always read and understand relevant files before proposing code edits.
Do not speculate about code you have not inspected. If the user references
a specific file, open and inspect it before explaining or proposing fixes.
</code_exploration>
```

**Prevent hallucination:**
```xml
<investigate_before_answering>
Never speculate about code you have not opened. Investigate and read relevant
files BEFORE answering questions about the codebase. Give grounded answers
based on actual code inspection.
</investigate_before_answering>
```

## Solution Quality

**Avoid overengineering:**
```xml
<minimal_solutions>
Only make changes that are directly requested or clearly necessary.
- Don't add features beyond what was asked
- Don't refactor surrounding code during a bug fix
- Don't add error handling for impossible scenarios
- Don't create abstractions for one-time operations
- Reuse existing abstractions where possible
</minimal_solutions>
```

**Write general solutions:**
```xml
<solution_quality>
Implement solutions that work correctly for all valid inputs, not just test cases.
Do not hard-code values. Focus on understanding the problem and implementing
the correct algorithm. If tests are incorrect, inform the user.
</solution_quality>
```

## File Management

**Clean up temporary files:**
```xml
<file_cleanup>
If you create temporary files or scripts for iteration, clean them up
by removing them at the end of the task.
</file_cleanup>
```

**Minimize new files:**
```xml
<file_creation>
Prefer modifying existing files over creating new ones when the functionality
belongs together. New files should follow existing naming conventions.
</file_creation>
```

## Research and Investigation

**Structured research:**
```xml
<research_approach>
Search systematically. As you gather data:
1. Develop competing hypotheses
2. Track confidence levels
3. Self-critique your approach
4. Persist information to files
5. Break complex tasks into steps
</research_approach>
```

**Source verification:**
```xml
<verification>
Verify information across multiple sources when possible.
Define clear success criteria for complete answers.
</verification>
```

## Codebase Familiarity

**Respect existing patterns:**
```xml
<codebase_awareness>
Before implementing, review the codebase for:
- Existing patterns that solve similar problems
- Naming conventions
- Import/export patterns
- Test patterns and utilities
- Documentation standards

Reuse existing abstractions. Follow DRY.
</codebase_awareness>
```

**Check for existing solutions:**
```xml
<existing_solutions>
Before implementing:
1. Search for similar existing functionality
2. Check for utilities or helpers
3. Look for documented patterns in instruction files
4. Review how similar problems were solved elsewhere

Prefer extending existing solutions over creating new ones.
</existing_solutions>
```

## Choosing Directives

Include these XML directives in agent bodies based on agent type:

| Agent Type | Recommended Directives |
|------------|----------------------|
| Code generator | `code_exploration`, `minimal_solutions`, `codebase_awareness` |
| Reviewer | `investigate_before_answering`, `verification` |
| Refactoring | `existing_solutions`, `file_cleanup` |
| Research | `research_approach`, `verification` |
