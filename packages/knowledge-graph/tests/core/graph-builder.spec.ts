import {beforeEach, describe, expect, it} from 'vitest';
import {GraphBuilder} from '../../src/core/graph-builder.js';

describe('GraphBuilder', () => {
  let builder: GraphBuilder;

  beforeEach(() => {
    builder = new GraphBuilder();
  });

  describe('createNode()', () => {
    it('should create node with single label', () => {
      const id = builder.createNode('Component', {name: 'SearchBox'});
      expect(id).toBe(1);

      const nodes = builder.getNodes();
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        id: 1,
        type: 'node',
        labels: ['Component'],
        properties: {name: 'SearchBox'},
      });
    });

    it('should create node with multiple labels', () => {
      const id = builder.createNode(['Component', 'LitComponent'], {
        name: 'SearchBox',
        framework: 'lit',
      });

      const nodes = builder.getNodes();
      expect(nodes[0]).toMatchObject({
        id,
        labels: ['Component', 'LitComponent'],
        properties: {name: 'SearchBox', framework: 'lit'},
      });
    });

    it('should assign unique sequential IDs', () => {
      const id1 = builder.createNode('Component', {name: 'SearchBox'});
      const id2 = builder.createNode('Component', {name: 'Facet'});
      const id3 = builder.createNode('Controller', {
        name: 'SearchBoxController',
      });

      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);
    });

    it('should handle empty properties', () => {
      const id = builder.createNode('Test', {});
      const nodes = builder.getNodes();

      expect(nodes[0]).toMatchObject({
        id,
        properties: {},
      });
    });

    it('should handle various property types', () => {
      builder.createNode('Test', {
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {key: 'value'},
      });

      const nodes = builder.getNodes();
      expect(nodes[0].properties).toEqual({
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {key: 'value'},
      });
    });
  });

  describe('createRelationship()', () => {
    it('should create relationship between nodes', () => {
      const node1 = builder.createNode('Component', {name: 'SearchBox'});
      const node2 = builder.createNode('Controller', {
        name: 'SearchBoxController',
      });

      const relId = builder.createRelationship(node1, node2, 'USES_CONTROLLER');

      const relationships = builder.getRelationships();
      expect(relationships).toHaveLength(1);
      expect(relationships[0]).toMatchObject({
        id: relId,
        type: 'relationship',
        label: 'USES_CONTROLLER',
        start: node1,
        end: node2,
        properties: {},
      });
    });

    it('should create relationship with properties', () => {
      const node1 = builder.createNode('Package', {name: 'atomic'});
      const node2 = builder.createNode('Package', {name: 'headless'});

      builder.createRelationship(node1, node2, 'DEPENDS_ON', {
        version: '^2.0.0',
      });

      const relationships = builder.getRelationships();
      expect(relationships[0]).toMatchObject({
        label: 'DEPENDS_ON',
        properties: {version: '^2.0.0'},
      });
    });

    it('should assign unique sequential IDs to relationships', () => {
      const node1 = builder.createNode('A', {});
      const node2 = builder.createNode('B', {});
      const node3 = builder.createNode('C', {});

      const rel1 = builder.createRelationship(node1, node2, 'LINKS_TO');
      const rel2 = builder.createRelationship(node2, node3, 'LINKS_TO');
      const rel3 = builder.createRelationship(node1, node3, 'LINKS_TO');

      expect(rel1).toBe(1);
      expect(rel2).toBe(2);
      expect(rel3).toBe(3);
    });

    it('should allow multiple relationships between same nodes', () => {
      const node1 = builder.createNode('File', {name: 'component.ts'});
      const node2 = builder.createNode('Component', {name: 'SearchBox'});

      builder.createRelationship(node1, node2, 'EXPORTS');
      builder.createRelationship(node1, node2, 'DEFINES');

      const relationships = builder.getRelationships();
      expect(relationships).toHaveLength(2);
      expect(relationships[0].label).toBe('EXPORTS');
      expect(relationships[1].label).toBe('DEFINES');
    });
  });

  describe('getStats()', () => {
    it('should return zero stats for empty graph', () => {
      const stats = builder.getStats();
      expect(stats).toEqual({
        nodes: 0,
        relationships: 0,
        total: 0,
      });
    });

    it('should return correct node count', () => {
      builder.createNode('A', {});
      builder.createNode('B', {});
      builder.createNode('C', {});

      const stats = builder.getStats();
      expect(stats.nodes).toBe(3);
      expect(stats.relationships).toBe(0);
      expect(stats.total).toBe(3);
    });

    it('should return correct relationship count', () => {
      const n1 = builder.createNode('A', {});
      const n2 = builder.createNode('B', {});
      const n3 = builder.createNode('C', {});

      builder.createRelationship(n1, n2, 'LINKS');
      builder.createRelationship(n2, n3, 'LINKS');

      const stats = builder.getStats();
      expect(stats.nodes).toBe(3);
      expect(stats.relationships).toBe(2);
      expect(stats.total).toBe(5);
    });

    it('should return correct total count', () => {
      const n1 = builder.createNode('A', {});
      const n2 = builder.createNode('B', {});
      builder.createRelationship(n1, n2, 'LINKS');

      const stats = builder.getStats();
      expect(stats.total).toBe(3); // 2 nodes + 1 relationship
    });
  });

  describe('getGraph()', () => {
    it('should return empty array for empty graph', () => {
      const graph = builder.getGraph();
      expect(graph).toEqual([]);
    });

    it('should return nodes and relationships together', () => {
      const n1 = builder.createNode('Component', {name: 'SearchBox'});
      const n2 = builder.createNode('Controller', {
        name: 'SearchBoxController',
      });
      builder.createRelationship(n1, n2, 'USES');

      const graph = builder.getGraph();
      expect(graph).toHaveLength(3);

      const nodes = graph.filter((item) => item.type === 'node');
      const relationships = graph.filter(
        (item) => item.type === 'relationship'
      );

      expect(nodes).toHaveLength(2);
      expect(relationships).toHaveLength(1);
    });

    it('should be serializable to JSON', () => {
      builder.createNode('Test', {value: 123});
      const graph = builder.getGraph();

      expect(() => JSON.stringify(graph)).not.toThrow();
      const json = JSON.stringify(graph, null, 2);
      expect(json).toContain('"type": "node"');
      expect(json).toContain('"value": 123');
    });
  });

  describe('toJSON()', () => {
    it('should return serializable graph', () => {
      const n1 = builder.createNode('A', {x: 1});
      const n2 = builder.createNode('B', {y: 2});
      builder.createRelationship(n1, n2, 'LINKS');

      const json = builder.toJSON();
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(3);
    });

    it('should produce formatted JSON when second arg is true', () => {
      builder.createNode('Test', {});
      const json = builder.toJSON(true);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('integration', () => {
    it('should build a realistic component graph', () => {
      // Create a component
      const componentId = builder.createNode(['Component', 'LitComponent'], {
        name: 'AtomicSearchBox',
        path: 'packages/atomic/src/components/search/atomic-search-box/atomic-search-box.tsx',
        framework: 'lit',
      });

      // Create a controller
      const controllerId = builder.createNode('Controller', {
        name: 'SearchBoxController',
        buildFunction: 'buildSearchBox',
        package: 'search',
      });

      // Link them
      builder.createRelationship(componentId, controllerId, 'USES_CONTROLLER');

      // Create a test
      const testId = builder.createNode('Test', {
        path: 'packages/atomic/src/components/search/atomic-search-box/atomic-search-box.spec.ts',
        framework: 'vitest',
      });

      // Link test to component
      builder.createRelationship(testId, componentId, 'TESTS');

      const stats = builder.getStats();
      expect(stats).toEqual({
        nodes: 3,
        relationships: 2,
        total: 5,
      });

      const graph = builder.getGraph();
      expect(graph).toHaveLength(5);
    });
  });
});
