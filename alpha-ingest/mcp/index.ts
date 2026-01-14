#!/usr/bin/env node
/**
 * MCP Server for the Coveo UI-Kit Knowledge Graph.
 *
 * Exposes Neo4j graph queries as MCP tools that OpenCode can use.
 */

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import neo4j, {type Driver, type Session} from 'neo4j-driver';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

// Load .env from mcp directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '.env')});

// Neo4j connection
let driver: Driver | null = null;

function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
      )
    );
  }
  return driver;
}

async function runQuery(
  query: string,
  params: Record<string, unknown> = {}
): Promise<Record<string, unknown>[]> {
  const session: Session = getDriver().session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => record.toObject());
  } finally {
    await session.close();
  }
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const TOOLS: Tool[] = [
  {
    name: 'find_component',
    description:
      "Find an Atomic component by its tag name (e.g., 'atomic-search-box'). Returns component details, controllers it consumes, and its properties.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        tag: {
          type: 'string',
          description: 'Component tag name or partial match',
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'find_component_properties',
    description:
      'Get all properties (attributes) of an Atomic component. Returns property name, HTML attribute, type, default value, and description.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tag: {
          type: 'string',
          description: 'Component tag name or partial match',
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'find_property_usage',
    description:
      'Find which components use a specific property name. Useful for impact analysis when removing or renaming a property.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_name: {
          type: 'string',
          description: 'Property name or attribute name to search for',
        },
      },
      required: ['property_name'],
    },
  },
  {
    name: 'analyze_property_impact',
    description:
      'Analyze the impact of removing a property from a component. Shows property details, connected controllers, and related actions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        component_tag: {
          type: 'string',
          description: "The exact component tag (e.g., 'atomic-search-box')",
        },
        property_name: {
          type: 'string',
          description: 'The property name to analyze',
        },
      },
      required: ['component_tag', 'property_name'],
    },
  },
  {
    name: 'find_controller',
    description:
      "Find a Headless controller by name (e.g., 'SearchBox'). Returns controller details and the actions it dispatches.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Controller name or partial match',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'trace_component_to_actions',
    description:
      'Trace the full path from an Atomic component to the Redux actions it triggers. Shows: Component → Controller → Actions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tag: {
          type: 'string',
          description: 'The exact component tag',
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'find_action_handlers',
    description:
      "Find which reducers handle a specific action type (e.g., 'search/executeSearch'). Useful for understanding state changes.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        action_type: {
          type: 'string',
          description: 'Action type or name to search for',
        },
      },
      required: ['action_type'],
    },
  },
  {
    name: 'list_package_dependencies',
    description:
      "List dependencies of a package (e.g., '@coveo/atomic'). Shows what other @coveo packages it depends on.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        package_name: {
          type: 'string',
          description: 'Package name or partial match',
        },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'run_cypher',
    description:
      'Run a custom Cypher query against the knowledge graph. Available nodes: Package, Component, Controller, Action, Reducer, Property. Relationships: CONTAINS, CONSUMES, DISPATCHES, HANDLES, DEPENDS_ON, HAS_PROPERTY.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Cypher query to execute',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_graph_schema',
    description:
      'Get the schema of the knowledge graph - what node types and relationships exist with counts.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'find_export_usage',
    description:
      "Find which packages import a specific exported function, type, or constant (e.g., 'defineParameterManager', 'SearchEngine'). Useful for deprecation impact analysis.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        export_name: {
          type: 'string',
          description: 'The name of the exported function, type, or constant',
        },
      },
      required: ['export_name'],
    },
  },
  {
    name: 'find_export',
    description:
      "Find an exported symbol by name. Returns which package exports it and the file where it's defined.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Export name or partial match',
        },
      },
      required: ['name'],
    },
  },
];

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

async function findComponent(tag: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (c:Component)
    WHERE c.tag CONTAINS $tag
    OPTIONAL MATCH (c)-[:CONSUMES]->(ctrl:Controller)
    OPTIONAL MATCH (c)-[:HAS_PROPERTY]->(p:Property)
    RETURN c.tag as tag, c.file as file, 
           collect(DISTINCT ctrl.name) as controllers,
           collect(DISTINCT {name: p.name, attribute: p.attribute, type: p.type, defaultValue: p.defaultValue}) as properties
    LIMIT 10
    `,
    {tag}
  );

  if (!results.length) return `No components found matching '${tag}'`;

  const output: string[] = [];
  for (const r of results) {
    const controllers = (r.controllers as string[]).filter(Boolean);
    const props = (r.properties as Array<Record<string, unknown>>).filter(
      (p) => p.name
    );

    let propsStr = '';
    if (props.length) {
      propsStr = '\n  Properties:\n';
      for (const p of props.slice(0, 10)) {
        propsStr += `    - ${p.name} (${p.attribute}): ${p.type} = ${p.defaultValue ?? 'undefined'}\n`;
      }
      if (props.length > 10)
        propsStr += `    ... and ${props.length - 10} more\n`;
    }

    output.push(
      `- ${r.tag}\n  File: ${r.file}\n  Controllers: ${controllers.join(', ') || 'none'}${propsStr}`
    );
  }
  return output.join('\n');
}

async function findComponentProperties(tag: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property)
    WHERE c.tag CONTAINS $tag
    RETURN c.tag as component, p.name as name, p.attribute as attribute, 
           p.type as type, p.defaultValue as defaultValue, 
           p.reflect as reflect, p.description as description
    ORDER BY p.name
    `,
    {tag}
  );

  if (!results.length)
    return `No properties found for component matching '${tag}'`;

  const byComponent: Record<string, Array<Record<string, unknown>>> = {};
  for (const r of results) {
    const comp = r.component as string;
    if (!byComponent[comp]) byComponent[comp] = [];
    byComponent[comp].push(r);
  }

  const output: string[] = [];
  for (const [comp, props] of Object.entries(byComponent)) {
    output.push(`Properties for ${comp} (${props.length} total):\n`);
    for (const p of props) {
      const desc = p.description as string | null;
      const descStr = desc
        ? `\n      Description: ${desc.slice(0, 100)}${desc.length > 100 ? '...' : ''}`
        : '';
      const reflectStr = p.reflect ? ' [reflects]' : '';
      output.push(
        `  - ${p.name} (attribute: ${p.attribute})${reflectStr}\n` +
          `      Type: ${p.type}\n` +
          `      Default: ${p.defaultValue ?? 'undefined'}${descStr}`
      );
    }
  }
  return output.join('\n');
}

async function findPropertyUsage(propertyName: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property)
    WHERE p.name CONTAINS $propName OR p.attribute CONTAINS $propName
    RETURN c.tag as component, c.file as file, p.name as property, 
           p.attribute as attribute, p.type as type, p.defaultValue as defaultValue
    ORDER BY c.tag
    `,
    {propName: propertyName}
  );

  if (!results.length)
    return `No components found with property matching '${propertyName}'`;

  const output = [`Components with property matching '${propertyName}':\n`];
  for (const r of results) {
    output.push(
      `- ${r.component}\n` +
        `    Property: ${r.property} (attribute: ${r.attribute})\n` +
        `    Type: ${r.type} = ${r.defaultValue ?? 'undefined'}\n` +
        `    File: ${r.file}`
    );
  }
  return output.join('\n');
}

async function analyzePropertyImpact(
  componentTag: string,
  propertyName: string
): Promise<string> {
  const propResults = await runQuery(
    `
    MATCH (c:Component {tag: $tag})-[:HAS_PROPERTY]->(p:Property)
    WHERE p.name = $propName OR p.attribute = $propName
    RETURN p.name as name, p.attribute as attribute, p.type as type, 
           p.defaultValue as defaultValue, p.description as description
    `,
    {tag: componentTag, propName: propertyName}
  );

  const ctrlResults = await runQuery(
    `
    MATCH (c:Component {tag: $tag})-[:CONSUMES]->(ctrl:Controller)
    OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(a:Action)
    RETURN ctrl.name as controller, collect({name: a.name, type: a.type}) as actions
    `,
    {tag: componentTag}
  );

  const output = [
    `=== Impact Analysis: Removing '${propertyName}' from ${componentTag} ===\n`,
  ];

  if (propResults.length) {
    const p = propResults[0];
    if (!p) {
      output.push(
        `WARNING: Property '${propertyName}' not found in ${componentTag}`
      );
      output.push('');
    } else {
      output.push('Property Details:');
      output.push(`  Name: ${p.name}`);
      output.push(`  HTML Attribute: ${p.attribute}`);
      output.push(`  Type: ${p.type}`);
      output.push(`  Default Value: ${p.defaultValue ?? 'undefined'}`);
      if (p.description) output.push(`  Description: ${p.description}`);
      output.push('');
    }
  } else {
    output.push(
      `WARNING: Property '${propertyName}' not found in ${componentTag}`
    );
    output.push('This could mean:');
    output.push("  - The property doesn't exist");
    output.push("  - It's defined differently (check the source file)");
    output.push('  - The graph needs to be rescanned');
    output.push('');
  }

  if (ctrlResults.length) {
    output.push('Connected Controllers and Actions:');
    for (const r of ctrlResults) {
      output.push(`\n  Controller: ${r.controller}`);
      const actions = (r.actions as Array<{name: string; type: string}>).filter(
        (a) => a.name
      );
      for (const a of actions.slice(0, 5)) {
        output.push(`    → ${a.name} (${a.type})`);
      }
      if (actions.length > 5)
        output.push(`    ... and ${actions.length - 5} more`);
    }
  }

  output.push('\n\nRecommendations:');
  output.push('1. Search the codebase for usages of this property/attribute');
  output.push(
    '2. Check if any samples or documentation reference this property'
  );
  output.push('3. Consider deprecation before removal');

  return output.join('\n');
}

async function findController(name: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (ctrl:Controller)
    WHERE ctrl.name CONTAINS $name
    OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(a:Action)
    RETURN ctrl.name as name, ctrl.file as file, ctrl.buildFunction as buildFunc,
           collect({name: a.name, type: a.type}) as actions
    LIMIT 10
    `,
    {name}
  );

  if (!results.length) return `No controllers found matching '${name}'`;

  const output: string[] = [];
  for (const r of results) {
    const actions = (r.actions as Array<{name: string; type: string}>)
      .filter((a) => a.name)
      .map((a) => `${a.name} (${a.type})`);
    const actionsStr = actions.slice(0, 5).join(', ') || 'none';
    const more =
      actions.length > 5 ? ` ... and ${actions.length - 5} more` : '';
    output.push(
      `- ${r.name} (build function: ${r.buildFunc ?? 'unknown'})\n` +
        `  File: ${r.file}\n` +
        `  Dispatches: ${actionsStr}${more}`
    );
  }
  return output.join('\n');
}

async function traceComponentToActions(tag: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (c:Component {tag: $tag})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
    RETURN c.tag as component, ctrl.name as controller, 
           collect({name: a.name, type: a.type, kind: a.kind}) as actions
    `,
    {tag}
  );

  if (!results.length)
    return `No action trace found for '${tag}'. Component may not exist or has no controller links.`;

  const output = [`Action trace for ${tag}:\n`];
  for (const r of results) {
    output.push(`\n→ Controller: ${r.controller}`);
    for (const a of r.actions as Array<{
      name: string;
      type: string;
      kind: string;
    }>) {
      if (a.name) output.push(`  → Action: ${a.name} (${a.type}) [${a.kind}]`);
    }
  }
  return output.join('\n');
}

async function findActionHandlers(actionType: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (r:Reducer)-[:HANDLES]->(a:Action)
    WHERE a.type CONTAINS $actionType OR a.name CONTAINS $actionType
    RETURN r.name as reducer, r.file as file, a.name as action, a.type as actionType
    LIMIT 20
    `,
    {actionType}
  );

  if (!results.length)
    return `No reducers found handling actions matching '${actionType}'`;

  const output = [`Reducers handling '${actionType}':\n`];
  for (const r of results) {
    output.push(
      `- ${r.reducer} handles ${r.action} (${r.actionType})\n  File: ${r.file}`
    );
  }
  return output.join('\n');
}

async function listPackageDependencies(packageName: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (p:Package)
    WHERE p.name CONTAINS $name
    OPTIONAL MATCH (p)-[:DEPENDS_ON]->(dep:Package)
    OPTIONAL MATCH (p)-[:DEV_DEPENDS_ON]->(devDep:Package)
    OPTIONAL MATCH (p)-[:PEER_DEPENDS_ON]->(peerDep:Package)
    RETURN p.name as package, p.path as path,
           collect(DISTINCT dep.name) as dependencies,
           collect(DISTINCT devDep.name) as devDependencies,
           collect(DISTINCT peerDep.name) as peerDependencies
    LIMIT 5
    `,
    {name: packageName}
  );

  if (!results.length) return `No packages found matching '${packageName}'`;

  const output: string[] = [];
  for (const r of results) {
    const deps = (r.dependencies as string[]).filter(Boolean);
    const devDeps = (r.devDependencies as string[]).filter(Boolean);
    const peerDeps = (r.peerDependencies as string[]).filter(Boolean);
    output.push(`Package: ${r.package} (${r.path})`);
    output.push(`  Dependencies: ${deps.join(', ') || 'none'}`);
    output.push(`  Dev Dependencies: ${devDeps.join(', ') || 'none'}`);
    output.push(`  Peer Dependencies: ${peerDeps.join(', ') || 'none'}`);
  }
  return output.join('\n');
}

async function runCypherQuery(query: string): Promise<string> {
  try {
    const results = await runQuery(query);
    if (!results.length) return 'Query returned no results';

    const output: string[] = [];
    for (let i = 0; i < Math.min(results.length, 20); i++) {
      output.push(`[${i + 1}] ${JSON.stringify(results[i])}`);
    }
    if (results.length > 20)
      output.push(`\n... and ${results.length - 20} more results`);
    return output.join('\n');
  } catch (e) {
    return `Query error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function getGraphSchema(): Promise<string> {
  const nodeCounts = await runQuery(`
    MATCH (n)
    WITH labels(n) as labels
    UNWIND labels as label
    RETURN label, count(*) as count
    ORDER BY count DESC
  `);

  const relCounts = await runQuery(`
    MATCH ()-[r]->()
    RETURN type(r) as relationship, count(*) as count
    ORDER BY count DESC
  `);

  const output = ['=== Knowledge Graph Schema ===\n', 'Node Types:'];
  for (const r of nodeCounts) {
    output.push(`  - ${r.label}: ${r.count} nodes`);
  }

  output.push('\nRelationships:');
  for (const r of relCounts) {
    output.push(`  - ${r.relationship}: ${r.count} edges`);
  }

  return output.join('\n');
}

async function findExportUsage(exportName: string): Promise<string> {
  const exportInfo = await runQuery(
    `
    MATCH (e:Export)
    WHERE e.name = $name
    RETURN e.name as name, e.kind as kind, e.package as package, e.file as file
    `,
    {name: exportName}
  );

  const importers = await runQuery(
    `
    MATCH (pkg:Package)-[r:IMPORTS]->(e:Export {name: $name})
    RETURN DISTINCT pkg.name as importer, pkg.path as path, r.file as importFile
    ORDER BY pkg.name
    `,
    {name: exportName}
  );

  const output: string[] = [];

  if (exportInfo.length) {
    output.push(`=== Export: ${exportName} ===\n`);
    for (const e of exportInfo) {
      output.push(`Defined in: ${e.package}`);
      output.push(`  Kind: ${e.kind}`);
      output.push(`  File: ${e.file}\n`);
    }
  } else {
    output.push(`Export '${exportName}' not found in the graph.\n`);
    output.push('Try a partial match with find_export tool.');
    return output.join('\n');
  }

  if (importers.length) {
    output.push(`Imported by ${importers.length} package(s):\n`);
    for (const r of importers) {
      output.push(`- ${r.importer}`);
      output.push(`    Path: ${r.path}`);
      if (r.importFile) output.push(`    In file: ${r.importFile}`);
    }
  } else {
    output.push('No packages import this export.');
  }

  return output.join('\n');
}

async function findExport(name: string): Promise<string> {
  const results = await runQuery(
    `
    MATCH (e:Export)
    WHERE e.name CONTAINS $name
    RETURN e.name as name, e.kind as kind, e.package as package, e.file as file
    ORDER BY e.name
    LIMIT 20
    `,
    {name}
  );

  if (!results.length) return `No exports found matching '${name}'`;

  const output = [`Exports matching '${name}':\n`];
  for (const r of results) {
    output.push(`- ${r.name} (${r.kind})`);
    output.push(`    Package: ${r.package}`);
    output.push(`    File: ${r.file}`);
  }
  return output.join('\n');
}

// =============================================================================
// MCP SERVER
// =============================================================================

const server = new Server(
  {
    name: 'uikit-knowledge-graph',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params;

  try {
    let result: string;

    switch (name) {
      case 'find_component':
        result = await findComponent((args as {tag: string}).tag);
        break;
      case 'find_component_properties':
        result = await findComponentProperties((args as {tag: string}).tag);
        break;
      case 'find_property_usage':
        result = await findPropertyUsage(
          (args as {property_name: string}).property_name
        );
        break;
      case 'analyze_property_impact':
        result = await analyzePropertyImpact(
          (args as {component_tag: string; property_name: string})
            .component_tag,
          (args as {component_tag: string; property_name: string}).property_name
        );
        break;
      case 'find_controller':
        result = await findController((args as {name: string}).name);
        break;
      case 'trace_component_to_actions':
        result = await traceComponentToActions((args as {tag: string}).tag);
        break;
      case 'find_action_handlers':
        result = await findActionHandlers(
          (args as {action_type: string}).action_type
        );
        break;
      case 'list_package_dependencies':
        result = await listPackageDependencies(
          (args as {package_name: string}).package_name
        );
        break;
      case 'run_cypher':
        result = await runCypherQuery((args as {query: string}).query);
        break;
      case 'get_graph_schema':
        result = await getGraphSchema();
        break;
      case 'find_export_usage':
        result = await findExportUsage(
          (args as {export_name: string}).export_name
        );
        break;
      case 'find_export':
        result = await findExport((args as {name: string}).name);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{type: 'text', text: result}],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UI-Kit Knowledge Graph MCP server running on stdio');
}

main().catch(console.error);
