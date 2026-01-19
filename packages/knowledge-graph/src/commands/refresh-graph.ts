#!/usr/bin/env node

/**
 * Refresh the knowledge graph - scan the codebase and write directly to Memgraph
 * This combines the generate and import steps into a single command
 */

import {execSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Driver, Session} from 'neo4j-driver';
import neo4j from 'neo4j-driver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// Memgraph connection
const MEMGRAPH_URI = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
const MEMGRAPH_USER = process.env.MEMGRAPH_USER || '';
const MEMGRAPH_PASSWORD = process.env.MEMGRAPH_PASSWORD || '';

interface GraphNode {
  type: 'node';
  id: number;
  labels: string[];
  properties: Record<string, unknown>;
}

interface GraphRelationship {
  type: 'relationship';
  label: string;
  start: number;
  end: number;
  properties: Record<string, unknown>;
}

async function importToMemgraph(
  graphData: (GraphNode | GraphRelationship)[]
): Promise<void> {
  console.log('\n🔌 Connecting to Memgraph...');

  const driver: Driver = neo4j.driver(
    MEMGRAPH_URI,
    neo4j.auth.basic(MEMGRAPH_USER, MEMGRAPH_PASSWORD),
    {disableLosslessIntegers: true}
  );

  try {
    const session: Session = driver.session();
    await session.run('RETURN 1');
    console.log('✅ Connected to Memgraph\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ Database cleared\n');

    const nodes = graphData.filter(
      (item): item is GraphNode => item.type === 'node'
    );
    const relationships = graphData.filter(
      (item): item is GraphRelationship => item.type === 'relationship'
    );

    // Import nodes
    console.log('📦 Importing nodes...');
    let nodeCount = 0;
    for (const node of nodes) {
      const labels = node.labels.join(':');
      const propsStr = Object.entries(node.properties)
        .map(([key, _value]) => `${key}: $${key}`)
        .join(', ');

      const query = `CREATE (n:${labels} {id: $id, ${propsStr}})`;
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

    // Create indexes
    console.log('🔍 Creating indexes...');
    await session.run('CREATE INDEX ON :Package(name)');
    await session.run('CREATE INDEX ON :Component(name)');
    await session.run('CREATE INDEX ON :File(path)');
    await session.run('CREATE INDEX ON :Test(path)');
    console.log('✅ Indexes created\n');

    // Verify import
    const result = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as label, count(n) as count
      ORDER BY count DESC
    `);

    console.log('📊 Node counts by label:');
    result.records.forEach((record) => {
      console.log(`   ${record.get('label')}: ${record.get('count')}`);
    });

    await session.close();
  } catch (error) {
    console.error('❌ Error during Memgraph operations:', error);
    throw error;
  } finally {
    await driver.close();
  }
}

async function main() {
  try {
    // Run the generate script to get the graph data
    console.log('Running graph generation...\n');
    const generateScript = path.join(__dirname, 'generate-graph.js');

    // Execute generate-graph and capture the output path
    execSync(`node "${generateScript}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });

    // Load the generated JSON
    const graphPath = path.join(PROJECT_ROOT, 'ui-kit-graph.json');
    const {readFileSync} = await import('node:fs');
    const graphData = JSON.parse(readFileSync(graphPath, 'utf-8'));

    console.log(`\n✅ Graph generation complete!`);
    console.log(
      `   Nodes: ${graphData.filter((i: GraphNode | GraphRelationship) => i.type === 'node').length}`
    );
    console.log(
      `   Relationships: ${graphData.filter((i: GraphNode | GraphRelationship) => i.type === 'relationship').length}`
    );

    await importToMemgraph(graphData);

    // Clean up JSON file
    const {unlinkSync} = await import('node:fs');
    unlinkSync(graphPath);
    console.log('🗑️  Cleaned up temporary JSON file');

    console.log('\n✅ Knowledge graph refresh completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open Memgraph Lab: http://localhost:7444');
    console.log('   2. Try queries like:');
    console.log('      MATCH (c:Component) RETURN c LIMIT 10');
    console.log(
      '      MATCH (p:Package)-[:DEPENDS_ON]->(d:Package) RETURN p, d'
    );
    console.log('   3. Start the MCP server: pnpm run server');
  } catch (error) {
    console.error('❌ Error refreshing knowledge graph:', error);
    process.exit(1);
  }
}

main();
