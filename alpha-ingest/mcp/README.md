# UI-Kit Knowledge Graph MCP Server

An MCP (Model Context Protocol) server that exposes the Neo4j knowledge graph to AI assistants like OpenCode.

## Setup

### 1. Install dependencies

```bash
cd alpha-ingest/mcp
npm install
```

### 2. Configure Neo4j connection

```bash
cp .env.example .env
# Edit .env with your Neo4j credentials if different from defaults
```

### 3. Build the server

```bash
npm run build
```

## Configure OpenCode

Add the MCP server to your OpenCode configuration. 

Edit `~/.config/opencode/config.json` (or the appropriate config location) and add:

```json
{
  "mcpServers": {
    "uikit-graph": {
      "command": "node",
      "args": ["/path/to/ui-kit/alpha-ingest/mcp/dist/index.js"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "your-password"
      }
    }
  }
}
```

Replace `/path/to/ui-kit` with the actual path to the repository.

Alternatively, for development, you can use `tsx` directly:

```json
{
  "mcpServers": {
    "uikit-graph": {
      "command": "npx",
      "args": ["tsx", "/path/to/ui-kit/alpha-ingest/mcp/index.ts"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "your-password"
      }
    }
  }
}
```

## Available Tools

Once configured, OpenCode will have access to these tools:

| Tool | Description |
|------|-------------|
| `find_component` | Find Atomic components by tag name |
| `find_component_properties` | Get all properties of a component |
| `find_property_usage` | Find which components use a property |
| `analyze_property_impact` | Analyze impact of removing a property |
| `find_controller` | Find Headless controllers by name and category |
| `trace_component_to_actions` | Trace Component → Controller → Actions |
| `find_action_handlers` | Find reducers handling actions |
| `list_package_dependencies` | Show package dependencies |
| `run_cypher` | Execute custom Cypher queries |
| `get_graph_schema` | Show graph schema and counts |

## Example Usage in OpenCode

Once the MCP is configured, you can ask OpenCode questions like:

- "Use the knowledge graph to find what properties atomic-search-box has"
- "What's the impact of removing numberOfQueries from atomic-search-box?"
- "Trace the actions from atomic-result-list to the reducers"
- "What packages depend on @coveo/headless?"

### Sample Application Queries

The graph also includes **Application nodes** for samples in `samples/`. Different sample categories have different relationship types:

| Category | Uses `USES_COMPONENT` | Uses `CONSUMES` |
|----------|----------------------|-----------------|
| `atomic` | Yes (web components) | Yes (engines) |
| `headless` | No | Yes (controllers) |
| `headless-ssr` | No | Yes (controllers) |

**Example queries:**

```cypher
-- List all samples by category
MATCH (app:Application)
RETURN app.category, collect(app.name) as samples

-- Find samples using headless controllers
MATCH (app:Application)-[:CONSUMES]->(ctrl:Controller)
WHERE app.category IN ['headless', 'headless-ssr']
RETURN app.name, collect(DISTINCT ctrl.name) as controllers

-- Full trace: Sample → Controller → Action
MATCH (app:Application)-[:CONSUMES]->(ctrl:Controller)
OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(action:Action)
RETURN app.name, ctrl.name, collect(DISTINCT action.name) as actions
```

### Action Analysis Queries

The graph tracks action properties to help identify orphaned or dead code:

| Property | Type | Description |
|----------|------|-------------|
| `kind` | `'sync'` or `'async'` | How the action was created |
| `emitsRelay` | boolean | True if action calls `relay.emit()` |
| `validateOnly` | boolean | True if action only validates payload |

**Find true orphan actions (dead code):**
```cypher
-- Sync actions that only validate, aren't handled, and don't dispatch others
MATCH (a:Action)
WHERE a.kind = 'sync'
  AND a.type IS NOT NULL
  AND NOT EXISTS { MATCH (:Reducer)-[:HANDLES]->(a) }
  AND NOT EXISTS { MATCH (a)-[:DISPATCHES]->(:Action) }
OPTIONAL MATCH (src)-[:DISPATCHES]->(a)
RETURN DISTINCT a.name, a.type, collect(src.name) as dispatchedBy
```

**Find action-to-action dispatch chains:**
```cypher
MATCH (a:Action)-[:DISPATCHES]->(b:Action)
RETURN a.name, b.name, b.type
```

### Controller Categories

Controllers are categorized by use-case to distinguish same-named controllers with different implementations:

| Category | Description |
|----------|-------------|
| `search` | Standard search controllers |
| `insight` | Insight panel controllers |
| `commerce` | Commerce/product listing controllers |
| `recommendation` | Recommendation controllers |
| `case-assist` | Case assist controllers |
| `ssr` | Server-side rendering controllers |

**Query controllers by category:**
```cypher
MATCH (c:Controller {category: 'insight'})-[:DISPATCHES]->(a:Action)
RETURN c.name, a.name
```

## Troubleshooting

### "Connection refused" errors

Make sure Neo4j is running:
```bash
# If using Docker
docker ps | grep neo4j

# If using Neo4j Desktop, ensure the database is started
```

### "No data" from queries

Run the scanners to populate the graph:
```bash
cd alpha-ingest
npm run scan:all
```

### MCP not showing in OpenCode

1. Check the config path is correct
2. Restart OpenCode after config changes
3. Check OpenCode logs for MCP connection errors
