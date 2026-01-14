import * as dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

async function querySearchBox() {
  const session = driver.session();

  console.log('=== atomic-search-box -> SearchBox -> search/* actions ===\n');

  const result = await session.run(`
    MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller {name: 'SearchBox'})-[:DISPATCHES]->(a:Action)
    WHERE a.type IS NOT NULL AND a.type STARTS WITH 'search/'
    RETURN c.tag as component, ctrl.name as controller, a.name as action, a.type as actionType
  `);

  for (const record of result.records) {
    console.log(
      `${record.get('component')} -> ${record.get('controller')} -> ${record.get('action')} (${record.get('actionType')})`
    );
  }

  console.log(
    '\n=== Full path: Component -> Controller -> Action -> Reducer ===\n'
  );

  const fullPath = await session.run(`
    MATCH (c:Component {tag: 'atomic-search-box'})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)<-[:HANDLES]-(r:Reducer)
    WHERE a.type IS NOT NULL
    RETURN c.tag as component, ctrl.name as controller, a.name as action, a.type as actionType, r.name as reducer
    LIMIT 20
  `);

  for (const record of fullPath.records) {
    console.log(
      `${record.get('component')} -> ${record.get('controller')} -> ${record.get('action')} (${record.get('actionType')}) <- ${record.get('reducer')}`
    );
  }

  await session.close();
  await driver.close();
}

querySearchBox();
