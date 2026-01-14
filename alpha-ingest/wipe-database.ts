import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

async function wipeDatabase() {
  const session = driver.session();

  console.log('=== Wiping Neo4j Database ===\n');

  const countBefore = await session.run(`
    MATCH (n) RETURN count(n) as nodes
  `);
  console.log(`Nodes before: ${countBefore.records[0]?.get('nodes')}`);

  const relsBefore = await session.run(`
    MATCH ()-[r]->() RETURN count(r) as rels
  `);
  console.log(`Relationships before: ${relsBefore.records[0]?.get('rels')}`);

  console.log('\nDeleting all nodes and relationships...');
  await session.run(`MATCH (n) DETACH DELETE n`);

  const countAfter = await session.run(`
    MATCH (n) RETURN count(n) as nodes
  `);
  console.log(`\nNodes after: ${countAfter.records[0]?.get('nodes')}`);

  console.log('\n=== Database Wiped ===');

  await session.close();
  await driver.close();
}

wipeDatabase();
