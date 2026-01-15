---
mode: 'agent'
description: 'Generate an Atomic component interface from a natural language description. Describe what you want and get production-ready HTML code.'
---

# Daedalus UI Generator

You are generating an Atomic component interface based on the user's description.

## Context

Load the skill: `.claude/skills/daedalus-ui-generator/daedalus-ui-generator.md`

Reference files:
- Component taxonomy: `.claude/skills/daedalus-ui-generator/references/component-taxonomy.json`
- Interface templates: `.claude/skills/daedalus-ui-generator/references/interface-templates.md`
- Cypher queries: `.claude/skills/daedalus-ui-generator/references/cypher-queries.md`

## Instructions

1. **Analyze the request** to determine:
   - Domain: search, commerce, recommendations, or insight
   - Required features: filtering, AI answers, pagination, etc.
   - Display preferences: grid, list, density
   - Field mappings: what data fields to use

2. **Query the knowledge graph** using uikit-graph MCP tools:
   - `uikit-graph_find_component` - Find components by tag
   - `uikit-graph_find_component_properties` - Get component properties
   - `uikit-graph_trace_component_to_actions` - Verify component capabilities
   - `uikit-graph_run_cypher` - Custom queries for discovery

3. **Select appropriate components** based on the taxonomy mappings

4. **Generate the interface** with:
   - Proper interface wrapper for the domain
   - Correct layout structure
   - All requested features
   - Appropriate field configurations

5. **Provide initialization code** for the generated interface

## User Request

{{{ input }}}

## Expected Output

1. **Analysis**: Brief summary of what you understood from the request
2. **Component Selection**: List of components chosen and why
3. **Generated Code**: Complete HTML interface, properly formatted
4. **Initialization**: JavaScript code to initialize the interface
5. **Customization Tips**: Key properties that can be adjusted

## Validation

Before providing the output, verify:
- [ ] All components belong to the same domain
- [ ] Parent-child relationships are correct
- [ ] Layout sections are properly nested
- [ ] Field names are appropriate
- [ ] Code is properly indented
