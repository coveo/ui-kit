#!/usr/bin/env node
/**
 * MCP Server for querying the ui-kit knowledge graph from Memgraph
 *
 * This server provides tools for AI agents to query the knowledge graph directly.
 *
 * Stage 1: Query Memory - Logs all queries and tracks entity access patterns
 */

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import type {Tool} from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {Driver, Record as Neo4jRecord, Session} from 'neo4j-driver';
import neo4j from 'neo4j-driver';

// Memgraph connection (uses Bolt protocol, same as Neo4j)
const MEMGRAPH_URI = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
const MEMGRAPH_USER = process.env.MEMGRAPH_USER || '';
const MEMGRAPH_PASSWORD = process.env.MEMGRAPH_PASSWORD || '';

let driver: Driver;
let isConnected = false;

interface QueryLogEntry {
  timestamp: string;
  query: string;
  params: Record<string, unknown>;
  success: boolean;
  error: string | null;
  resultCount: number;
  duration: number;
}

/**
 * Initialize Memgraph connection
 */
async function initMemgraph(): Promise<void> {
  try {
    driver = neo4j.driver(
      MEMGRAPH_URI,
      neo4j.auth.basic(MEMGRAPH_USER, MEMGRAPH_PASSWORD),
      {disableLosslessIntegers: true}
    );

    // Test connection
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();

    isConnected = true;
    console.error('✅ Connected to Memgraph');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Failed to connect to Memgraph:', err.message);
    console.error(
      '   Make sure Memgraph is running: docker run -p 7687:7687 memgraph/memgraph-mage'
    );
    isConnected = false;
  }
}

/**
 * Execute a Cypher query against Memgraph
 */
async function executeQuery(
  query: string,
  params: Record<string, unknown> = {}
): Promise<Record<string, unknown>[]> {
  if (!isConnected) {
    throw new Error(
      'Not connected to Memgraph. Please ensure Memgraph is running.'
    );
  }

  const startTime = Date.now();
  const session: Session = driver.session();
  let success = false;
  let error: string | null = null;
  let results: Record<string, unknown>[] = [];

  try {
    const result = await session.run(query, params);
    results = result.records.map((record: Neo4jRecord) => record.toObject());
    success = true;
    return results;
  } catch (err) {
    error = (err as Error).message;
    throw err;
  } finally {
    const duration = Date.now() - startTime;
    await session.close();

    // Log query execution (async, don't await to avoid blocking)
    logQuery({
      timestamp: new Date().toISOString(),
      query,
      params,
      success,
      error,
      resultCount: results.length,
      duration,
    }).catch(() => {
      // Ignore logging errors
    });
  }
}

/**
 * Log query to Memgraph
 */
async function logQuery(logEntry: QueryLogEntry): Promise<void> {
  if (!isConnected) {
    return;
  }

  const session = driver.session();
  try {
    await session.run(
      `
      CREATE (log:QueryLog {
        timestamp: $timestamp,
        query: $query,
        params: $params,
        success: $success,
        error: $error,
        resultCount: $resultCount,
        duration: $duration
      })
      `,
      {
        timestamp: logEntry.timestamp,
        query: logEntry.query,
        params: JSON.stringify(logEntry.params),
        success: logEntry.success,
        error: logEntry.error,
        resultCount: logEntry.resultCount,
        duration: logEntry.duration,
      }
    );
  } catch (err) {
    // Silently fail - don't disrupt query execution due to logging issues
    console.error('Failed to log query to Memgraph:', (err as Error).message);
  } finally {
    await session.close();
  }
}

/**
 * Convert query results to readable format
 */
function formatResults(
  results: Record<string, unknown>[]
): Record<string, unknown>[] {
  return results.map((record) => {
    const formatted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      // Handle Neo4j node/relationship objects
      if (
        value &&
        typeof value === 'object' &&
        'properties' in value &&
        value.properties
      ) {
        formatted[key] = {
          labels: 'labels' in value ? value.labels : [],
          ...(value.properties as Record<string, unknown>),
        };
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });
}

// Define MCP tools
const TOOLS: Tool[] = [
  {
    name: 'query_knowledge_graph',
    description: `Execute a Cypher query against the ui-kit knowledge graph in Memgraph. Use this to find components, packages, dependencies, tests, and relationships.

Node Types: Package, File, Component (LitComponent, StencilComponent), Controller, Test, Instruction, Skill, Agent, Prompt
Relationships: CONTAINS, DEPENDS_ON, EXPORTS, IMPORTS, USES_CONTROLLER, TESTS, APPLIES_TO, MIGRATED_FROM, HAS_STORY

Examples:
- Find all Lit components: MATCH (c:LitComponent) RETURN c.name, c.path
- Package dependencies: MATCH (p:Package)-[:DEPENDS_ON]->(d) RETURN p.name, d.name
- Untested components: MATCH (c:Component) WHERE NOT (c)<-[:TESTS]-() RETURN c.name
- Migration progress: MATCH (s:StencilComponent) OPTIONAL MATCH (l:LitComponent)-[:MIGRATED_FROM]->(s) RETURN count(s), count(l)

See scripts/knowledge-graph/schema.md for complete schema and example-queries.md for more examples.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Cypher query to execute (e.g., "MATCH (c:Component) RETURN c LIMIT 10")',
        },
        params: {
          type: 'object',
          description: 'Optional parameters for the query',
          additionalProperties: true,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_component',
    description: 'Find a component by name in the knowledge graph',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Component name in PascalCase (e.g., "AtomicSearchBox", "AtomicFacet"). NEVER use kebab-case tag names like "atomic-search-box".',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_component_dependencies',
    description: 'Get all controllers and dependencies used by a component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description:
            'Component name in PascalCase (e.g., "AtomicFacet", "AtomicSearchBox"). NEVER use kebab-case tag names like "atomic-facet".',
        },
      },
      required: ['componentName'],
    },
  },
  {
    name: 'find_tests_for_file',
    description: 'Find all tests that test a specific file or component',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'File path (relative to project root)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_package_dependencies',
    description: 'Get all dependencies for a package',
    inputSchema: {
      type: 'object',
      properties: {
        packageName: {
          type: 'string',
          description: 'Package name (e.g., "@coveo/atomic")',
        },
      },
      required: ['packageName'],
    },
  },
  {
    name: 'find_applicable_instructions',
    description: 'Find instruction files that apply to a specific file path',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'File path to check',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'find_migrated_components',
    description: 'Find Lit components that were migrated from Stencil',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_component_stories',
    description: 'Find Storybook stories for a component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Component name',
        },
      },
      required: ['componentName'],
    },
  },
  {
    name: 'get_graph_schema',
    description:
      'Get the knowledge graph schema including all node types, relationship types, and their properties. Use this to understand the graph structure before writing custom Cypher queries.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_query_stats',
    description:
      'Get statistics about recent queries: success rate, most queried entities, common patterns, failed queries. Use this to understand how the graph is being used and what might be missing.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of recent queries to analyze (default: 100)',
          default: 100,
        },
      },
    },
  },
  {
    name: 'export_query_log',
    description:
      'Export the query log as JSON for analysis. Returns all logged queries with timestamps, success status, duration, and result counts.',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          description: 'ISO timestamp to get queries since (optional)',
        },
      },
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'ui-kit-knowledge-graph',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {tools: TOOLS};
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params;

  if (!isConnected) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: Not connected to Memgraph. Please ensure Memgraph is running on bolt://localhost:7687',
        },
      ],
    };
  }

  try {
    let results: Record<string, unknown>[];

    switch (name) {
      case 'query_knowledge_graph': {
        results = await executeQuery(
          (args as {query: string; params?: Record<string, unknown>}).query,
          (args as {query: string; params?: Record<string, unknown>}).params ||
            {}
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'find_component': {
        const query = `
          MATCH (c:Component {name: $name})
          OPTIONAL MATCH (f:File)-[:EXPORTS]->(c)
          RETURN c, f
        `;
        results = await executeQuery(query, {
          name: (args as {name: string}).name,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'get_component_dependencies': {
        const query = `
          MATCH (c:Component {name: $name})-[:USES_CONTROLLER]->(ctrl:Controller)
          RETURN c, ctrl
        `;
        results = await executeQuery(query, {
          name: (args as {componentName: string}).componentName,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'find_tests_for_file': {
        const query = `
          MATCH (f:File {path: $path})<-[:TESTS]-(t:Test)
          RETURN f, t
        `;
        results = await executeQuery(query, {
          path: (args as {path: string}).path,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'get_package_dependencies': {
        const query = `
          MATCH (p:Package {name: $name})-[:DEPENDS_ON]->(dep:Package)
          RETURN p, dep
        `;
        results = await executeQuery(query, {
          name: (args as {packageName: string}).packageName,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'find_applicable_instructions': {
        const query = `
          MATCH (i:Instruction)
          WHERE $path =~ i.applyTo OR i.applyTo = '**'
          RETURN i
        `;
        results = await executeQuery(query, {
          path: (args as {filePath: string}).filePath,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'find_migrated_components': {
        const limit = Math.max(
          1,
          Math.min(100, (args as {limit?: number}).limit || 10)
        );
        const query = `
          MATCH (lit:LitComponent)-[:MIGRATED_FROM]->(stencil:StencilComponent)
          RETURN lit, stencil
          LIMIT ${limit}
        `;
        results = await executeQuery(query, {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'get_component_stories': {
        const query = `
          MATCH (c:Component {name: $name})-[:HAS_STORY]->(s:Story)
          RETURN c, s
        `;
        results = await executeQuery(query, {
          name: (args as {componentName: string}).componentName,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatResults(results), null, 2),
            },
          ],
        };
      }

      case 'get_graph_schema': {
        const schema = {
          nodeTypes: {
            Package: {
              properties: ['name', 'path', 'version', 'description'],
            },
            File: {
              properties: ['path', 'name', 'extension', 'size', 'type'],
              subtypes: ['SourceFile', 'TestFile', 'ConfigFile', 'StoryFile'],
            },
            Component: {
              properties: ['name', 'path', 'framework', 'type'],
              subtypes: [
                'LitComponent',
                'StencilComponent',
                'ReactComponent',
                'FunctionalComponent',
              ],
            },
            Controller: {
              properties: ['name', 'path', 'type'],
              subtypes: ['HeadlessController', 'ReactiveController'],
            },
            Test: {
              properties: ['path', 'name', 'framework'],
              subtypes: ['UnitTest', 'E2ETest'],
            },
            Instruction: {
              properties: ['path', 'applyTo', 'description', 'name'],
            },
            Skill: {properties: ['name', 'path', 'description']},
            Agent: {properties: ['name', 'path', 'description']},
            Prompt: {properties: ['name', 'path', 'description']},
            Story: {properties: ['path', 'component', 'title']},
          },
          relationshipTypes: {
            CONTAINS: {
              from: 'Package',
              to: 'File/Component',
              description: 'Package contains files or components',
            },
            DEPENDS_ON: {
              from: 'Package',
              to: 'Package',
              description: 'Package depends on another package',
              properties: ['version'],
            },
            EXPORTS: {
              from: 'File',
              to: 'Component/Class/Function',
              description: 'File exports an entity',
            },
            IMPORTS: {
              from: 'File',
              to: 'File',
              description: 'File imports from another file',
            },
            USES_CONTROLLER: {
              from: 'Component',
              to: 'Controller',
              description: 'Component uses a controller',
            },
            TESTS: {
              from: 'Test',
              to: 'Component/File',
              description: 'Test file tests a source file or component',
            },
            APPLIES_TO: {
              from: 'Instruction',
              to: 'File',
              description: 'Instruction applies to files matching pattern',
            },
            MIGRATED_FROM: {
              from: 'LitComponent',
              to: 'StencilComponent',
              description: 'Lit component migrated from Stencil',
            },
            HAS_STORY: {
              from: 'Component',
              to: 'Story',
              description: 'Component has Storybook stories',
            },
            USES_SKILL: {
              from: 'Agent',
              to: 'Skill',
              description: 'Agent uses a skill',
            },
          },
          examples: [
            {
              query: 'MATCH (c:Component) RETURN c.name, c.framework LIMIT 10',
              description: 'List components',
            },
            {
              query:
                'MATCH (p:Package)-[:DEPENDS_ON]->(d:Package) RETURN p.name, d.name',
              description: 'Package dependencies',
            },
            {
              query:
                'MATCH (c:Component) WHERE NOT (c)<-[:TESTS]-() RETURN c.name',
              description: 'Untested components',
            },
            {
              query:
                'MATCH (lit:LitComponent)-[:MIGRATED_FROM]->(s:StencilComponent) RETURN lit.name, s.name',
              description: 'Migration tracking',
            },
          ],
          documentation:
            'See scripts/knowledge-graph/schema.md for detailed documentation and example-queries.md for more query examples',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      }

      case 'get_query_stats': {
        try {
          const limit = (args as {limit?: number}).limit || 100;

          // Get recent query logs from Memgraph
          const logsQuery = `
            MATCH (log:QueryLog)
            RETURN log
            ORDER BY log.timestamp DESC
            LIMIT ${limit}
          `;
          const logResults = await executeQuery(logsQuery, {});

          const logs = logResults.map((r: Record<string, unknown>) => {
            const log = r.log as Record<string, unknown>;
            return {
              params: JSON.parse((log.params as string) || '{}'),
              success: log.success as boolean,
              error: log.error as string | null,
              resultCount: log.resultCount as number,
              duration: log.duration as number,
            };
          });

          const stats = {
            totalQueries: logs.length,
            successfulQueries: logs.filter((l) => l.success).length,
            failedQueries: logs.filter((l) => !l.success).length,
            avgDuration:
              logs.length > 0
                ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length
                : 0,
            avgResultCount:
              logs.length > 0
                ? logs.reduce((sum, l) => sum + (l.resultCount || 0), 0) /
                  logs.length
                : 0,
            recentFailures: logs
              .filter((l) => !l.success)
              .slice(0, 5)
              .map((l) => ({
                timestamp: l.timestamp,
                query: l.query.substring(0, 100),
                error: l.error,
              })),
            slowQueries: logs
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 5)
              .map((l) => ({
                duration: l.duration,
                query: l.query.substring(0, 100),
                resultCount: l.resultCount,
              })),
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error reading query logs: ${(err as Error).message}`,
              },
            ],
          };
        }
      }

      case 'export_query_log': {
        try {
          const since = (args as {since?: string}).since;

          const logsQuery = `
            MATCH (log:QueryLog)
            ${since ? 'WHERE log.timestamp >= $since' : ''}
            RETURN log
            ORDER BY log.timestamp DESC
          `;

          const logResults = await executeQuery(
            logsQuery,
            since ? {since} : {}
          );

          const logs = logResults.map((r: Record<string, unknown>) => {
            const log = r.log as Record<string, unknown>;
            return {
              timestamp: log.timestamp as string,
              query: log.query as string,
              params: JSON.parse((log.params as string) || '{}'),
              success: log.success as boolean,
              error: log.error as string | null,
              resultCount: log.resultCount as number,
              duration: log.duration as number,
            };
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(logs, null, 2),
              },
            ],
          };
        } catch (err) {
          return {
            content: [
              {
                type: 'text',
                text: `Error exporting query logs: ${(err as Error).message}`,
              },
            ],
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  await initMemgraph();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 UI-Kit Knowledge Graph MCP Server running');
  console.error('   Ready to receive queries...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
