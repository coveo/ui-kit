#!/usr/bin/env node
/**
 * Import the generated knowledge graph into Memgraph
 *
 * Usage: node scripts/knowledge-graph/import-to-memgraph.mjs [--input <path>]
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Driver, Session} from 'neo4j-driver';
import neo4j from 'neo4j-driver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const INPUT_FILE =
  inputIndex >= 0 && args[inputIndex + 1]
    ? path.resolve(args[inputIndex + 1])
    : path.join(__dirname, '../../../../ui-kit-graph.json');

// Memgraph connection
const MEMGRAPH_URI = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
const MEMGRAPH_USER = process.env.MEMGRAPH_USER || '';
const MEMGRAPH_PASSWORD = process.env.MEMGRAPH_PASSWORD || '';

interface GraphNode {
  type: 'node';
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

interface GraphRelationship {
  type: 'relationship';
  label: string;
  start: string;
  end: string;
  properties: Record<string, unknown>;
}

type GraphItem = GraphNode | GraphRelationship;

async function importGraph(): Promise<void> {
  console.log('🚀 Starting knowledge graph import...\n');

  // Load graph data
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Graph file not found: ${INPUT_FILE}`);
    console.error('   Run "pnpm generate" first to create the graph');
    process.exit(1);
  }

  const graphData: GraphItem[] = JSON.parse(
    fs.readFileSync(INPUT_FILE, 'utf-8')
  );
  const nodes = graphData.filter(
    (item): item is GraphNode => item.type === 'node'
  );
  const relationships = graphData.filter(
    (item): item is GraphRelationship => item.type === 'relationship'
  );

  console.log(`📊 Graph statistics:`);
  console.log(`   Nodes: ${nodes.length}`);
  console.log(`   Relationships: ${relationships.length}\n`);

  // Connect to Memgraph
  console.log('🔌 Connecting to Memgraph...');
  const driver: Driver = neo4j.driver(
    MEMGRAPH_URI,
    neo4j.auth.basic(MEMGRAPH_USER, MEMGRAPH_PASSWORD),
    {disableLosslessIntegers: true}
  );

  try {
    const session: Session = driver.session();

    // Test connection
    await session.run('RETURN 1');
    console.log('✅ Connected to Memgraph\n');

    // Clear existing data (optional - comment out to append instead)
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ Database cleared\n');

    // Import nodes
    console.log('📦 Importing nodes...');
    let nodeCount = 0;
    for (const node of nodes) {
      const labels = node.labels.join(':');
      const propsStr = Object.entries(node.properties)
        .map(([key, _value]) => `${key}: $${key}`)
        .join(', ');

      const query = `
        CREATE (n:${labels} {id: $id, ${propsStr}})
      `;

      await session.run(query, {id: node.id, ...node.properties});
      nodeCount++;

      if (nodeCount % 100 === 0) {
        console.log(`   Imported ${nodeCount}/${nodes.length} nodes...`);
      }
    }
    console.log(`✅ Imported ${nodeCount} nodes\n`);

    // Import relationships
    console.log('🔗 Importing relationships...');
    let relCount = 0;
    for (const rel of relationships) {
      const propsStr =
        Object.keys(rel.properties).length > 0
          ? Object.entries(rel.properties)
              .map(([key, _value]) => `${key}: $${key}`)
              .join(', ')
          : '';

      const propsClause = propsStr ? `{${propsStr}}` : '';

      const query = `
        MATCH (a {id: $start})
        MATCH (b {id: $end})
        CREATE (a)-[r:${rel.label} ${propsClause}]->(b)
      `;

      await session.run(query, {
        start: rel.start,
        end: rel.end,
        ...rel.properties,
      });
      relCount++;

      if (relCount % 100 === 0) {
        console.log(
          `   Imported ${relCount}/${relationships.length} relationships...`
        );
      }
    }
    console.log(`✅ Imported ${relCount} relationships\n`);

    // Create indexes for better query performance
    console.log('🔍 Creating indexes...');
    await session.run('CREATE INDEX ON :Package(name)');
    await session.run('CREATE INDEX ON :Component(name)');
    await session.run('CREATE INDEX ON :File(path)');
    await session.run('CREATE INDEX ON :Test(path)');
    console.log('✅ Indexes created\n');

    // Verify import
    console.log('✅ Verifying import...');
    const result = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as label, count(n) as count
      ORDER BY count DESC
    `);

    console.log('\n📊 Node counts by label:');
    result.records.forEach((record) => {
      console.log(`   ${record.get('label')}: ${record.get('count')}`);
    });

    await session.close();
    console.log('\n✅ Import completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open Memgraph Lab: http://localhost:7444');
    console.log('   2. Try queries like:');
    console.log('      MATCH (c:Component) RETURN c LIMIT 10');
    console.log(
      '      MATCH (p:Package)-[:DEPENDS_ON]->(d:Package) RETURN p, d'
    );
    console.log(
      '   3. Start the MCP server: cd scripts/knowledge-graph && pnpm server'
    );
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

importGraph();
