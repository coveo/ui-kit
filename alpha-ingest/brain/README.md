# Coveo UI-Kit Knowledge Graph Agent

A LangGraph-based agent that queries the Neo4j knowledge graph to answer questions about the Coveo UI-Kit codebase.

## Setup

### 1. Install Python dependencies

```bash
cd alpha-ingest/brain
pip install -r requirements.txt
```

### 2. Configure Anthropic access

1. Create an Anthropic API key and copy it.
2. Configure env:
   ```bash
   cp .env.example .env
   # Paste your key into ANTHROPIC_API_KEY
   # Optionally change ANTHROPIC_MODEL
   ```

### 4. Ensure Neo4j is running and populated

```bash
cd alpha-ingest
npm run scan:all
```

## Usage

### Interactive Chat

```bash
cd alpha-ingest/brain
python agent.py
```

### Programmatic Use

```python
from agent import ask

answer = ask("What controllers does atomic-search-box use?")
print(answer)
```

## LLM Providers

The agent supports multiple LLM backends. Set `LLM_PROVIDER` in `.env`:

| Provider | Value | Requirements |
|----------|-------|--------------|
| Anthropic (Claude) | `anthropic` (default) | `ANTHROPIC_API_KEY` |

## Available Tools

The agent has access to these tools for querying the knowledge graph:

| Tool | Description |
|------|-------------|
| `find_component` | Find Atomic components by tag name (includes properties) |
| `find_component_properties` | Get all properties/attributes of a component |
| `find_property_usage` | Find which components use a specific property |
| `analyze_property_impact` | Analyze impact of removing a property |
| `find_controller` | Find Headless controllers by name |
| `trace_component_to_actions` | Trace Component → Controller → Actions path |
| `find_action_handlers` | Find reducers that handle specific actions |
| `list_package_dependencies` | Show package dependency graph |
| `run_cypher` | Execute custom Cypher queries |
| `get_graph_schema` | Show available node types and relationships |

## Example Queries

```
You: What controllers does atomic-search-box use?
Assistant: The atomic-search-box component uses the SearchBox controller...

You: Trace the actions from atomic-result-list
Assistant: Here's the action trace for atomic-result-list:
  → Controller: ResultList
    → Action: fetchMoreResults (search/fetchMoreResults) [async]
    → Action: registerResultTemplates...

You: What packages depend on @coveo/headless?
Assistant: The following packages depend on @coveo/headless:
  - @coveo/atomic (dependency)
  - @coveo/headless-react (peer dependency)
  ...

You: Show me the graph schema
Assistant: === Knowledge Graph Schema ===
  Node Types:
    - Package: 49 nodes
    - Component: 162 nodes
    - Controller: 185 nodes
    ...
```

## Graph Schema

```
(:Package)-[:CONTAINS]->(:Component)-[:CONSUMES]->(:Controller)-[:DISPATCHES]->(:Action)
(:Component)-[:HAS_PROPERTY]->(:Property)
(:Package)-[:CONTAINS]->(:Controller)
(:Package)-[:CONTAINS]->(:Reducer)-[:HANDLES]->(:Action)
(:Package)-[:DEPENDS_ON|DEV_DEPENDS_ON|PEER_DEPENDS_ON]->(:Package)
(:Application)-[:USES_COMPONENT]->(:Component)
(:Application)-[:CONSUMES]->(:Controller)
```

### Property Node

Each `Property` node contains:
- `name`: The TypeScript property name (e.g., `numberOfQueries`)
- `attribute`: The HTML attribute name (e.g., `number-of-queries`)
- `type`: The property type (e.g., `number`, `string`, `boolean`)
- `defaultValue`: The default value (e.g., `8`)
- `reflect`: Whether the property reflects to the attribute
- `description`: JSDoc description if available

## Troubleshooting

### "Missing ANTHROPIC_API_KEY"

1. Create an Anthropic API key
2. Paste it into `.env` as `ANTHROPIC_API_KEY`

### "Neo4j connection failed"

1. Ensure Neo4j is running: `docker ps` or check Neo4j Desktop
2. Verify credentials in `.env` match your Neo4j setup

### "No results found"

Run the scanners to populate the graph:
```bash
cd alpha-ingest
npm run scan:all
npm run check  # Verify graph has data
```
