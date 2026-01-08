# Prompt Engineer V2 Test Scenarios

Validation scenarios for the PromptEngineerV2 agent.

---

## Scenario 1: Ephemeral Response (One-Time Task)

### Input

> I need a regex pattern that validates Coveo organization IDs. They follow the format: lowercase letters and numbers, 8-32 characters, optionally prefixed with a region code like "na-" or "eu-".

### Expected Behavior

**Phase 1 (Understand):** Is this one-time? YES → Ephemeral Response

Agent should:
- Recognize no reuse expected
- Answer directly without creating files
- Provide working regex with examples

### Expected Output

Direct response with regex pattern:
```
Pattern: ^([a-z]{2}-)?[a-z0-9]{8,32}$
```

### Validation Checklist

- [ ] Did NOT create any files
- [ ] Provided working regex
- [ ] Included test examples

---

## Scenario 2: Prompt Creation

### Input

> We need a prompt to generate release notes from PR titles and commit messages. It should format them by package and categorize by type (feat, fix, refactor, etc.).

### Expected Behavior

**Phase 1 (Understand):**
- One-time? NO (reusable)
- User-invoked workflow? YES → Prompt

Agent should:
1. Run `node .github/skills/creating-prompts/scripts/init_prompt.mjs generate-release-notes`
2. Edit the generated file to fill TODO placeholders
3. Run validation script

### Expected Output

File: `.github/prompts/generate-release-notes.prompt.md`

### Validation Checklist

- [ ] Used creating-prompts skill
- [ ] Created file in `.github/prompts/`
- [ ] Proper YAML frontmatter (mode, tools)
- [ ] Ran validate_prompt.mjs
- [ ] No overlap with existing prompts

---

## Scenario 3: Skill Creation

### Input

> Create a test generation workflow that scaffolds test file structure, generates mock fixtures, and validates coverage. Include actual scripts to automate the scaffolding.

### Expected Behavior

**Phase 1 (Understand):**
- One-time? NO
- Agent-discoverable capability? YES → Skill

Agent should:
1. Run `node .github/skills/creating-skills/scripts/init_skill.mjs test-generator --path .github/skills`
2. Edit SKILL.md with test generation instructions
3. Create scaffolding scripts
4. Run quick_validate.mjs

### Expected Output

```
.github/skills/test-generator/
├── SKILL.md
└── scripts/
    ├── scaffold_test.mjs
    └── validate_coverage.mjs
```

### Validation Checklist

- [ ] Used creating-skills to initialize
- [ ] SKILL.md frontmatter complete
- [ ] Scripts are executable
- [ ] Ran quick_validate.mjs

---

## Scenario 4: Agent Creation

### Input

> Create an agent that analyzes bundle sizes, identifies large dependencies, and suggests optimization strategies. It should profile render performance and recommend code-splitting opportunities.

### Expected Behavior

**Phase 1 (Understand):**
- One-time? NO
- Specialized persona with tool control? YES → Agent

Agent should:
1. Run `node .github/skills/creating-agents/scripts/init_agent.mjs performance-optimizer`
2. Edit agent file with persona definition and optimization workflow
3. Define tool restrictions and analysis capabilities
4. Edit examples file with test scenarios
5. Run validate_agent.mjs

### Expected Output

1. `.github/agents/performance-optimizer-v1.agent.md`
2. `.github/agents/examples/performance-optimizer-examples.md`

### Validation Checklist

- [ ] Used creating-agents skill
- [ ] Proper frontmatter (name, description, tools)
- [ ] Test scenarios file created (3+ scenarios)
- [ ] Ran validate_agent.mjs
- [ ] No overlap with existing agents

---

## Scenario 5: Instruction Creation

### Input

> I want to create coding standards for the headless package. They need guidelines for state management patterns, controller naming conventions, and subscription handling that are specific to headless.

### Expected Behavior

**Phase 1 (Understand):**
- One-time? NO
- Coding standards for file patterns? YES → Instruction

Agent should:
1. Run `node .github/skills/creating-instructions/scripts/init_instruction.mjs headless --apply-to "packages/headless/**"`
2. Edit the generated file with headless-specific conventions
3. Run validation script

### Expected Output

File: `.github/instructions/headless.instructions.md`

### Validation Checklist

- [ ] Used creating-instructions skill
- [ ] Proper applyTo glob pattern
- [ ] Specific to headless package
- [ ] Ran validate_instruction.mjs
- [ ] No scope conflict with existing instructions

---

## Scenario 6: Modify Existing (Overlap Detection)

### Input

> Create a prompt for generating Vitest unit tests for Atomic Lit components.

### Expected Behavior

**Phase 2 (Decide):**
Agent should check existing artifacts and find:
- Potential overlap with test-related prompts in `.github/prompts/`
- Existing test instruction patterns (different artifact type)

**Decision:** Check if similar prompt exists

Agent should:
1. Show what test-related prompts already exist
2. Ask if user wants to:
   - Extend an existing test prompt
   - Create a new prompt with specific differentiation
   - Create something else (instruction, skill, agent)

### Expected Output

Clarification request with inventory of existing prompts (not instructions, as those are auto-applied standards).

### Validation Checklist

- [ ] Ran inventory commands (ls .github/prompts, etc.)
- [ ] Identified overlapping artifacts
- [ ] Did NOT create duplicate artifact
- [ ] Asked for clarification before proceeding

---

## Scenario 7: Replace/Supersede Existing

### Input

> The current test generation approach is outdated. Create a completely new test-generator skill that replaces any existing test-related prompts or skills.

### Expected Behavior

**Phase 1 (Understand):**
- Check for existing: test-related prompts, skills
- User explicitly wants replacement → REPLACE action

Agent should:
1. List what will be superseded
2. Confirm with user before deleting/modifying
3. Create new skill
4. Update or remove obsolete artifacts

### Expected Output

1. New `.github/skills/test-generator/`
2. Removed/deprecated obsolete artifacts

### Validation Checklist

- [ ] Inventoried existing artifacts
- [ ] Confirmed replacement scope with user
- [ ] Created new artifact
- [ ] Cleaned up obsolete artifacts
- [ ] Updated documentation

---

## Scenario 8: Ambiguous Request

### Input

> Make something that helps with testing.

### Expected Behavior

Agent should recognize ambiguity and ask for clarification:
- What kind of testing? (unit, e2e, accessibility)
- What package? (atomic, headless, quantic)
- One-time help or reusable?
- **How will it be invoked?**
  - Auto-applied coding standards? → Instruction
  - User triggers manually? → Prompt
  - Agent discovers when relevant? → Skill
  - Specialized persona needed? → Agent

### Expected Output

Clarification request explaining the artifact type decision depends on answers.

### Validation Checklist

- [ ] Did NOT create any artifact prematurely
- [ ] Asked specific questions
- [ ] Explained how answers affect artifact type

---

## Scenario 9: Skill with References

### Input

> Create a skill for component migration that includes detailed pattern documentation, migration checklists, and a validation script.

### Expected Behavior

Agent should:
1. Initialize skill with creating-skills
2. Create SKILL.md with core instructions
3. Add `references/` directory with detailed docs
4. Add validation script
5. Validate structure

### Expected Output

```
.github/skills/component-migration/
├── SKILL.md
├── scripts/
│   └── validate_migration.mjs
└── references/
    ├── patterns.md
    └── checklists.md
```

### Validation Checklist

- [ ] Used progressive disclosure (core in SKILL.md, details in references/)
- [ ] References linked from SKILL.md
- [ ] Validation script works
- [ ] Ran quick_validate.mjs

---

## Scenario 10: Modify Existing (MODIFY Action)

### Input

> The accessibility agent needs to check for color contrast issues. Update it to include WCAG 2.2 AA contrast ratio validation.

### Expected Behavior

**Phase 2 (Decide):**
Agent should find `.github/agents/accessibility-v1.agent.md` exists

**Decision:** MODIFY (exact match, needs update)

Agent should:
1. Read existing agent file
2. Identify where to add contrast validation
3. Make surgical edits preserving existing functionality
4. Run validate_agent.mjs
5. Update examples if needed

### Expected Output

Modified `.github/agents/accessibility-v1.agent.md` with new capabilities added

### Validation Checklist

- [ ] Inventoried existing agents
- [ ] Read full existing agent file before editing
- [ ] Made targeted edits (not wholesale replacement)
- [ ] Preserved existing features
- [ ] Ran validate_agent.mjs
- [ ] Did NOT create new file

---

## Scenario 11: Extend Existing (EXTEND Action)

### Input

> Add Python-specific conventions to the general TypeScript instructions for when TypeScript projects interface with Python services.

### Expected Behavior

**Phase 2 (Decide):**
Agent finds `general.typescript.instructions.md` exists

**Decision:** Recognize this is problematic - TypeScript instructions shouldn't contain Python content

Agent should:
1. Identify the scope mismatch
2. Suggest alternatives:
   - Create separate `python-typescript-interop.instructions.md`
   - Create `general.python.instructions.md` for Python-specific rules
3. Ask for clarification on intended scope

### Expected Output

Clarification request explaining the scope issue and suggesting alternatives

### Validation Checklist

- [ ] Identified scope mismatch
- [ ] Did NOT add Python content to TypeScript instructions
- [ ] Suggested appropriate alternatives
- [ ] Explained reasoning

---

## Scenario 12: Delete Obsolete (DELETE Action)

### Input

> We've consolidated all test generation into one skill. Remove the old individual test prompts: generate-vitest-tests-atomic-utils.prompt.md and generate-playwright-e2e-tests-atomic.prompt.md

### Expected Behavior

**Phase 1 (Understand):**
User explicitly requests deletion → DELETE action

Agent should:
1. Verify files exist
2. Check if they're referenced elsewhere (in skills, other artifacts)
3. Confirm with user before deletion
4. Remove files
5. Update any documentation that references them

### Expected Output

1. Files removed
2. Documentation updated
3. Summary of what was deleted and where references were removed

### Validation Checklist

- [ ] Confirmed files exist before attempting deletion
- [ ] Checked for references in other files
- [ ] Asked for confirmation before deleting
- [ ] Updated documentation
- [ ] Provided summary of changes

---

## Scenario 13: Agent Overlap Detection

### Input

> Create an agent that helps with accessibility reviews and WCAG compliance checking.

### Expected Behavior

**Phase 2 (Decide):**
Agent finds `accessibility-v1.agent.md` already exists

**Decision:** OVERLAP - exact match

Agent should:
1. Show existing accessibility agent
2. Ask if user wants to:
   - Use the existing agent
   - Modify/extend the existing agent
   - Create a different specialized agent (e.g., accessibility-auditor)

### Expected Output

Clarification request with existing agent details

### Validation Checklist

- [ ] Found existing accessibility agent
- [ ] Did NOT create duplicate
- [ ] Presented existing agent capabilities
- [ ] Asked for clarification on intent

---

## Scenario 14: Cross-Artifact Type Confusion

### Input

> Create a prompt that analyzes code and automatically fixes accessibility issues across the codebase.

### Expected Behavior

**Phase 1 (Understand):**
Agent recognizes artifact type mismatch:
- User said "prompt" (manual invocation)
- But "automatically fixes" suggests agent or skill (autonomous)

Agent should:
1. Identify the contradiction
2. Clarify invocation model:
   - Manual prompt that user triggers per-file?
   - Agent that autonomously scans codebase?
   - Skill that other agents can use?
3. Ask which behavior is intended

### Expected Output

Clarification request explaining the artifact type implications

### Validation Checklist

- [ ] Identified artifact type contradiction
- [ ] Did NOT create artifact prematurely
- [ ] Explained difference between prompt/agent/skill
- [ ] Asked about intended invocation model

---

## Scenario 15: Validation Failure Handling

### Input

> Create an agent for API testing with malformed frontmatter.

(Simulated: agent is created but validation fails due to missing required fields)

### Expected Behavior

Agent should:
1. Create initial agent file
2. Run validate_agent.mjs
3. See validation errors (e.g., missing description)
4. Fix the errors
5. Re-run validation until it passes

### Expected Output

1. Valid agent file
2. Validation passes
3. Agent reports what was fixed

### Validation Checklist

- [ ] Ran validation after creation
- [ ] Detected validation errors
- [ ] Fixed errors (didn't just report them)
- [ ] Re-ran validation to confirm fixes
- [ ] Final artifact passes validation

---

## Scenario 16: Scope Conflict (Instructions)

### Input

> Create an instruction for Atomic component styling that applies to packages/atomic/src/components/**

### Expected Behavior

**Phase 2 (Decide):**
Agent finds `atomic.instructions.md` with `applyTo: 'packages/atomic/**'`

**Decision:** SCOPE CONFLICT - new pattern is subset of existing

Agent should:
1. Identify the scope overlap
2. Explain that `atomic.instructions.md` already covers this path
3. Ask if user wants to:
   - Add styling rules to existing `atomic.instructions.md`
   - Create more specific instruction (e.g., for one component type)
   - Something else

### Expected Output

Clarification request explaining scope overlap

### Validation Checklist

- [ ] Detected scope conflict with existing instruction
- [ ] Explained which instruction already covers this path
- [ ] Did NOT create overlapping instruction
- [ ] Suggested alternatives

---

## Scenario 17: Agent Versioning

### Input

> The stencil-to-lit-migration agent needs major changes. It should use a completely different migration strategy. Create v3.

### Expected Behavior

**Phase 2 (Decide):**
Agent finds `stencil-to-lit-migration-v1.agent.md` and `stencil-to-lit-migration-v2.agent.md`

**Decision:** CREATE (new version)

Agent should:
1. Use creating-agents to initialize `stencil-to-lit-migration-v3.agent.md`
2. Note this doesn't auto-remove v1/v2 (user may want gradual migration)
3. Create new examples file
4. Optionally ask if old versions should be deprecated

### Expected Output

1. `.github/agents/stencil-to-lit-migration-v3.agent.md`
2. `.github/agents/examples/stencil-to-lit-migration-v3-examples.md`

### Validation Checklist

- [ ] Created v3 (not overwriting v2)
- [ ] New examples file
- [ ] Did NOT auto-delete previous versions
- [ ] Optionally asked about deprecation

---

## Scenario 18: Partial Overlap (Enhancement)

### Input

> Add bundle size analysis to the maintenance agent.

### Expected Behavior

**Phase 2 (Decide):**
Agent finds `maintenance-v1.agent.md`

**Decision:** EXTEND (add feature to existing)

Agent should:
1. Read existing maintenance agent
2. Check if bundle analysis already exists (partial overlap)
3. If not, add bundle size analysis to the agent's capabilities
4. Update examples with bundle analysis scenarios
5. Run validation

### Expected Output

Enhanced `maintenance-v1.agent.md` with bundle analysis capability

### Validation Checklist

- [ ] Read existing agent first
- [ ] Checked for partial overlap
- [ ] Added new capability without breaking existing
- [ ] Updated examples
- [ ] Ran validate_agent.mjs

---

## Scenario 19: Wrong Artifact Type (User Suggests)

### Input

> Create an instruction that developers can run to generate API documentation from TypeScript interfaces.

### Expected Behavior

**Phase 1 (Understand):**
Agent recognizes artifact type error:
- User said "instruction" (auto-applied)
- But "run to generate" suggests prompt (manual) or skill (with script)

Agent should:
1. Identify the contradiction
2. Explain that instructions are auto-applied, not "run"
3. Suggest correct artifact type:
   - Prompt if manual invocation by user
   - Skill if includes documentation generation script
4. Ask which is intended

### Expected Output

Clarification request explaining instructions are auto-applied, suggesting prompt or skill

### Validation Checklist

- [ ] Identified artifact type misunderstanding
- [ ] Explained what instructions actually do
- [ ] Suggested correct artifact types
- [ ] Did NOT create instruction for manual workflow

---

## Scenario 20: Multiple Valid Interpretations

### Input

> Create something for code reviews.

### Expected Behavior

**Phase 1 (Understand):**
Agent recognizes multiple valid interpretations:
- Ephemeral: one-time review help
- Prompt: manual review workflow per PR
- Agent: specialized reviewer persona with read-only tools
- Skill: review capability other agents discover
- Instruction: coding standards for reviews

Agent should:
1. List all possible interpretations
2. Ask clarifying questions:
   - One-time or reusable?
   - Manual trigger or autonomous?
   - Standards to follow or active reviewer?
3. Explain how each answer maps to artifact types

### Expected Output

Comprehensive clarification request with decision tree

### Validation Checklist

- [ ] Identified multiple interpretations
- [ ] Listed all possible artifact types
- [ ] Asked targeted clarifying questions
- [ ] Explained artifact type mapping
- [ ] Did NOT guess or create prematurely

---

## Scenario 21: Skill-First Decomposition (Persona USES Capability)

### Input

> Create an agent for creating and modifying Atomic components.

### Expected Behavior

**Phase 2 (Decide) - Step B: Architectural Decomposition:**
Agent should recognize "Persona USES Capability" pattern:
- Capability: Component creation knowledge (auxiliary, separable)
- Persona: Not clearly specified or justified

Agent should:
1. Identify that component knowledge is AUXILIARY (any agent might need it)
2. Recognize multiple agents could benefit from this capability
3. Propose creating skill first: `creating-atomic-components`
4. Ask: "Do you need a specialized agent, or is the discoverable skill sufficient?"

### Expected Output

1. Propose creating `creating-atomic-components` skill first
2. Ask clarifying question about whether agent persona is needed
3. If skill only: create skill
4. If agent also needed: create skill, then create agent that discovers it

### Validation Checklist

- [ ] Recognized "Persona USES Capability" pattern
- [ ] Did NOT immediately create an agent
- [ ] Proposed skill-first approach
- [ ] Asked about agent necessity
- [ ] If agent created: it discovers the skill (not duplicates the knowledge)

---

## Scenario 22: Identity-Based Agent (Persona IS Capability)

### Input

> Create a security reviewer agent that audits code for vulnerabilities.

### Expected Behavior

**Phase 2 (Decide) - Step B: Architectural Decomposition:**
Agent should recognize "Persona IS Capability" pattern:
- Capability: Security knowledge
- Persona: Security reviewer (the knowledge IS the agent's identity/purpose)

Agent should:
1. Identify that security expertise is the agent's PRIMARY PURPOSE
2. Recognize this is NOT auxiliary knowledge other agents need
3. Keep security knowledge built-in to the agent
4. NOT extract a `security-reviewing` skill first

### Expected Output

Create `.github/agents/security-reviewer-v1.agent.md` with built-in security knowledge

### Validation Checklist

- [ ] Recognized "Persona IS Capability" pattern
- [ ] Did NOT extract security knowledge as a skill
- [ ] Created agent with built-in knowledge
- [ ] Agent may discover procedural skills (e.g., `creating-security-reports`) but core expertise is built-in

---

## Scenario 23: Hybrid Skill + Agent Decomposition

### Input

> Create an agent that creates pull requests with accessibility checks included.

### Expected Behavior

**Phase 2 (Decide) - Step B: Architectural Decomposition:**
Agent should decompose into two parts:
- Capability: Accessibility checking knowledge (reusable, auxiliary)
- Persona: PR automation workflow (specialized behavior)

Agent should:
1. Identify a11y knowledge as AUXILIARY (other agents might need it)
2. Propose creating `accessibility-checking` skill first
3. Then create PR agent that discovers the skill
4. Agent persona handles PR workflow; skill provides a11y knowledge

### Expected Output

1. `.github/skills/accessibility-checking/SKILL.md`
2. `.github/agents/pr-accessibility-v1.agent.md` (discovers the skill)

### Validation Checklist

- [ ] Decomposed request into capability + persona
- [ ] Created skill first for reusable knowledge
- [ ] Created agent second for persona/workflow
- [ ] Agent discovers skill (not duplicates knowledge)
- [ ] Both artifacts validated

---

## Scenario 24: Skill + Prompt Decomposition

### Input

> Create something to automate component migrations from Stencil to Lit.

### Expected Behavior

**Phase 2 (Decide) - Step B: Architectural Decomposition:**
Agent should decompose:
- Capability: Migration procedures (reusable, could be used by multiple contexts)
- Invocation: User-triggered (manual)

Agent should:
1. Identify migration procedures as reusable capability → Skill
2. Identify user trigger requirement → Prompt
3. NOT create an agent (no specialized persona needed)
4. Create skill with migration knowledge and scripts
5. Create prompt that leverages the skill

### Expected Output

1. `.github/skills/stencil-to-lit-migration/SKILL.md` (with scripts)
2. `.github/prompts/migrate-stencil-to-lit.prompt.md` (uses skill)

### Validation Checklist

- [ ] Recognized reusable capability + manual trigger pattern
- [ ] Created skill for procedures
- [ ] Created prompt for user invocation
- [ ] Did NOT create agent (no persona needed)
- [ ] Prompt can leverage skill's knowledge

---

## Scenario 25: Over-Extraction Anti-Pattern

### Input

> Create a skill for the PromptEngineer's decision-making workflow so other agents can use it.

### Expected Behavior

**Phase 2 (Decide) - Step B: Architectural Decomposition:**
Agent should recognize this is an ANTI-PATTERN:
- The decision-making workflow IS the PromptEngineer's identity
- This is orchestration/judgment, not auxiliary knowledge
- Other agents don't need prompt engineering decision-making

Agent should:
1. Identify this as "Persona IS Capability" (decision-making is identity)
2. Recognize extraction would be over-engineering
3. Decline to extract as skill
4. Explain: "This is the agent's core orchestration logic, not separable domain knowledge"
5. Suggest alternatives if user has a different need in mind

### Expected Output

Decline with explanation: orchestration/decision-making should stay built-in to agents

### Validation Checklist

- [ ] Recognized over-extraction anti-pattern
- [ ] Did NOT create a skill for agent-specific orchestration
- [ ] Explained difference between domain knowledge (extractable) and orchestration (built-in)
- [ ] Applied "Don't over-extract" principle
- [ ] Offered to clarify if user meant something different
