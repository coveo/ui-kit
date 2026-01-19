# @coveo/knowledge-graph

Knowledge graph system for the Coveo UI-Kit monorepo. Extracts code entities and relationships, stores them in Memgraph, and provides an MCP server for programmatic access.

## Overview

This package analyzes the ui-kit codebase and builds a Neo4j-compatible knowledge graph containing:

- **Packages** and their dependencies
- **Components** (Lit/Stencil/Functional) and their relationships
- **Controllers** (Headless) and action dispatches
- **Actions** and **Reducers**
- **Tests** and what they test
- **Stories** and the components/engines they use
- **Files** and their contents
- **Simple entities** (Instructions, Skills, Agents, Prompts)

See [schema.md](./schema.md) for the complete graph schema.

## Installation

From the repository root:

```bash
pnpm install
```

The package is included in the workspace and will be installed automatically.

## Usage

### Generate Graph

Extract entities and relationships from the codebase:

```bash
pnpm kg:generate
```

This creates `ui-kit-graph.json` with all nodes and relationships.

### Import to Memgraph

Import the generated graph into Memgraph:

```bash
pnpm kg:import
```

Prerequisites:
- Memgraph running on `bolt://localhost:7687`
- See [Memgraph installation](https://memgraph.com/docs/getting-started/install-memgraph)

### Start MCP Server

Launch the Model Context Protocol server:

```bash
pnpm kg:server
```

The server provides tools for querying the knowledge graph. See the MCP SDK documentation for integration details.

### Update Everything

Generate and import in one command:

```bash
pnpm kg:update
```

## Development

### Build

```bash
cd packages/knowledge-graph
pnpm build
```

### Test

```bash
cd packages/knowledge-graph
pnpm test
```

### Project Structure

```
packages/knowledge-graph/
├── src/
│   ├── core/              # Layer 1: Graph primitives
│   │   ├── entity-cache.ts
│   │   ├── graph-builder.ts
│   │   └── relationship-linker.ts
│   ├── parsers/           # Layer 2: TypeScript utilities
│   │   ├── file-scanner.ts
│   │   └── import-resolver.ts
│   ├── config/            # Layer 3: Domain configuration
│   │   ├── action-rules.ts
│   │   ├── component-rules.ts
│   │   ├── controller-rules.ts
│   │   └── ... (more rules)
│   ├── commands/          # Entry points
│   │   ├── generate-graph.ts
│   │   ├── import-to-memgraph.ts
│   │   └── mcp-server.ts
│   └── index.ts           # Main export
├── tests/                 # Vitest tests
├── docs/                  # Additional documentation
└── schema.md              # Graph schema definition
```

## Documentation

- [schema.md](./schema.md) - Complete graph schema with node labels and relationships
- [docs/example-queries.md](./docs/example-queries.md) - Cypher query examples

## Meta-Circularity

The knowledge graph includes itself! After generating and importing, you can query for:

- The `@coveo/knowledge-graph` package node
- TypeScript source files in `packages/knowledge-graph/`
- The `EntityCache` and `GraphBuilder` classes
- Tests for the knowledge graph system

## License

See repository root for license information.
