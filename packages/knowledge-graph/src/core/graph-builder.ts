/**
 * Graph builder for creating nodes and relationships
 *
 * Handles node/relationship ID assignment and accumulation.
 * Output format is compatible with Memgraph JSON import.
 *
 * Layer 1: Graph Primitives (generic)
 */

export interface NodeData {
  id: number;
  type: 'node';
  labels: string[];
  properties: Record<string, unknown>;
}

export interface RelationshipData {
  id: number;
  type: 'relationship';
  label: string;
  start: number;
  end: number;
  properties: Record<string, unknown>;
}

export interface GraphStats {
  nodes: number;
  relationships: number;
  total: number;
}

export class GraphBuilder {
  private nodes: NodeData[];
  private relationships: RelationshipData[];
  private nodeId: number;
  private relId: number;

  constructor() {
    this.nodes = [];
    this.relationships = [];
    this.nodeId = 1;
    this.relId = 1;
  }

  /**
   * Create a node in the graph
   * @param labels - Node label(s)
   * @param properties - Node properties
   * @returns The node ID
   */
  createNode(
    labels: string | string[],
    properties: Record<string, unknown>
  ): number {
    const id = this.nodeId++;
    const node: NodeData = {
      id,
      type: 'node',
      labels: Array.isArray(labels) ? labels : [labels],
      properties: {...properties},
    };
    this.nodes.push(node);
    return id;
  }

  /**
   * Create a relationship between two nodes
   * @param startId - Start node ID
   * @param endId - End node ID
   * @param label - Relationship type/label
   * @param properties - Optional relationship properties
   * @returns The relationship ID
   */
  createRelationship(
    startId: number,
    endId: number,
    label: string,
    properties: Record<string, unknown> = {}
  ): number {
    const id = this.relId++;
    this.relationships.push({
      id,
      type: 'relationship',
      label,
      start: startId,
      end: endId,
      properties,
    });
    return id;
  }

  /**
   * Get all nodes
   * @returns Array of node data
   */
  getNodes(): NodeData[] {
    return this.nodes;
  }

  /**
   * Get all relationships
   * @returns Array of relationship data
   */
  getRelationships(): RelationshipData[] {
    return this.relationships;
  }

  /**
   * Get complete graph (nodes + relationships)
   * @returns Combined array of nodes and relationships
   */
  getGraph(): (NodeData | RelationshipData)[] {
    return [...this.nodes, ...this.relationships];
  }

  /**
   * Get graph statistics
   * @returns Statistics about the graph
   */
  getStats(): GraphStats {
    return {
      nodes: this.nodes.length,
      relationships: this.relationships.length,
      total: this.nodes.length + this.relationships.length,
    };
  }

  /**
   * Export graph as JSON string
   * @param pretty - Whether to pretty-print
   * @returns JSON string representation
   */
  toJSON(pretty = false): string {
    const graph = this.getGraph();
    return pretty ? JSON.stringify(graph, null, 2) : JSON.stringify(graph);
  }
}
