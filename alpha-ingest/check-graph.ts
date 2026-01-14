import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

async function checkGraph() {
  const session = driver.session();

  console.log('=== Node Counts ===');
  const countResult = await session.run(`
    MATCH (c:Component) WITH count(c) as components
    MATCH (ctrl:Controller) WITH components, count(ctrl) as controllers
    MATCH (a:Action) WITH components, controllers, count(a) as actions
    MATCH (r:Reducer) WITH components, controllers, actions, count(r) as reducers
    RETURN components, controllers, actions, reducers
  `);
  const counts = countResult.records[0];
  console.log(`  Components: ${counts?.get('components')}`);
  console.log(`  Controllers: ${counts?.get('controllers')}`);
  console.log(`  Actions: ${counts?.get('actions')}`);
  console.log(`  Reducers: ${counts?.get('reducers')}`);

  console.log('\n=== Relationship Counts ===');
  const relResult = await session.run(`
    MATCH (:Component)-[r1:CONSUMES]->(:Controller) WITH count(r1) as consumes
    MATCH (:Controller)-[r2:DISPATCHES]->(:Action) WITH consumes, count(r2) as dispatches
    MATCH (:Reducer)-[r3:HANDLES]->(:Action) WITH consumes, dispatches, count(r3) as handles
    RETURN consumes, dispatches, handles
  `);
  const rels = relResult.records[0];
  console.log(`  Component-[:CONSUMES]->Controller: ${rels?.get('consumes')}`);
  console.log(`  Controller-[:DISPATCHES]->Action: ${rels?.get('dispatches')}`);
  console.log(`  Reducer-[:HANDLES]->Action: ${rels?.get('handles')}`);

  console.log('\n=== Sample: atomic-search-box Path ===');
  const searchBoxResult = await session.run(`
    MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller)
    OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(a:Action)
    RETURN c.tag as component, ctrl.name as controller, collect(DISTINCT a.name) as actions
  `);
  for (const record of searchBoxResult.records) {
    console.log(`  ${record.get('component')} -> ${record.get('controller')}`);
    console.log(
      `    Actions: ${record.get('actions').slice(0, 5).join(', ')}...`
    );
  }

  console.log('\n=== Your Query Result ===');
  const queryResult = await session.run(`
    MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
    RETURN c.tag, ctrl.name, a.name, a.type
    LIMIT 15
  `);
  if (queryResult.records.length === 0) {
    console.log('  No results! The graph may not be fully connected.');

    console.log('\n=== Debugging: Check Controller Names ===');
    const ctrlNames = await session.run(`
      MATCH (ctrl:Controller) 
      WHERE ctrl.name IN ['SearchBox', 'Facet', 'ResultList', 'Pager']
      RETURN ctrl.name, ctrl.buildFunction
    `);
    for (const record of ctrlNames.records) {
      console.log(
        `  Controller: ${record.get('ctrl.name')} (${record.get('ctrl.buildFunction')})`
      );
    }

    console.log('\n=== Debugging: Check Component->Controller links ===');
    const compCtrl = await session.run(`
      MATCH (c:Component)-[:CONSUMES]->(ctrl:Controller)
      RETURN c.tag, ctrl.name
      LIMIT 10
    `);
    for (const record of compCtrl.records) {
      console.log(`  ${record.get('c.tag')} -> ${record.get('ctrl.name')}`);
    }
  } else {
    for (const record of queryResult.records) {
      console.log(
        `  ${record.get('c.tag')} -> ${record.get('ctrl.name')} -> ${record.get('a.name')} (${record.get('a.type')})`
      );
    }
  }

  await session.close();
  await driver.close();
}

checkGraph();
