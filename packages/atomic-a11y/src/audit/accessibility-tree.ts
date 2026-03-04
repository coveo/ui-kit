/**
 * Accessibility tree manipulation utilities.
 *
 * Provides functions for traversing, comparing, and truncating
 * accessibility tree snapshots from Playwright.
 */

import type {AccessibilityNode} from './types.js';

export type {AccessibilityNode};

/**
 * Flattens an accessibility tree into a linear array of nodes.
 *
 * @param node - Root node of the tree, or null
 * @param result - Accumulator array (used internally for recursion)
 * @returns Array of all nodes in depth-first order
 */
export function flattenTree(
  node: AccessibilityNode | null,
  result: AccessibilityNode[] = []
): AccessibilityNode[] {
  if (!node) return result;
  result.push(node);
  for (const child of node.children || []) {
    flattenTree(child, result);
  }
  return result;
}

/**
 * Creates a unique key for a node based on its properties.
 */
function nodeKey(node: AccessibilityNode): string {
  return `${node.role || ''}|${node.name || ''}|${node.value || ''}|${node.description || ''}`;
}

/**
 * Finds nodes that exist in the "after" tree but not in the "before" tree.
 *
 * Useful for detecting new content that appears after interactions
 * (e.g., tooltips, dropdowns, dynamic content).
 *
 * @param before - Accessibility tree before interaction
 * @param after - Accessibility tree after interaction
 * @returns Array of nodes that are new in the "after" tree
 */
export function diffAccessibilityTrees(
  before: AccessibilityNode | null,
  after: AccessibilityNode | null
): AccessibilityNode[] {
  const beforeKeys = new Set(flattenTree(before).map(nodeKey));
  const afterNodes = flattenTree(after);
  return afterNodes.filter((node) => !beforeKeys.has(nodeKey(node)));
}

/**
 * Prunes an accessibility tree to a maximum depth.
 *
 * Nodes beyond maxDepth are replaced with a placeholder indicating
 * how many children were pruned.
 *
 * @param node - Root node to prune
 * @param maxDepth - Maximum depth to preserve
 * @param currentDepth - Current recursion depth (internal)
 * @returns Pruned copy of the tree, or null
 */
export function pruneTree(
  node: AccessibilityNode | null,
  maxDepth: number,
  currentDepth: number = 0
): AccessibilityNode | null {
  if (!node) return null;

  const result = {...node};
  if (currentDepth >= maxDepth) {
    if (node.children && node.children.length > 0) {
      result.children = [
        {role: 'note', name: `[${node.children.length} children pruned]`},
      ];
    }
  } else if (node.children) {
    result.children = node.children
      .map((child) => pruneTree(child, maxDepth, currentDepth + 1))
      .filter((child): child is AccessibilityNode => child !== null);
  }

  return result;
}

/**
 * Truncates an accessibility tree to fit within a token budget.
 *
 * If the full tree exceeds the estimated token limit, it is pruned
 * to depth 3 and a summary note is appended.
 *
 * @param tree - Accessibility tree to truncate
 * @param maxTokenEstimate - Approximate maximum tokens allowed
 * @returns JSON string of the tree, possibly truncated
 */
export function truncateAccessibilityTree(
  tree: AccessibilityNode | null,
  maxTokenEstimate: number
): string {
  const fullJson = JSON.stringify(tree, null, 2);
  const estimatedTokens = Math.ceil(fullJson.length / 4);

  if (estimatedTokens <= maxTokenEstimate) {
    return fullJson;
  }

  const pruned = pruneTree(tree, 3);
  const prunedJson = JSON.stringify(pruned, null, 2);
  const nodeCount = flattenTree(tree).length;
  const prunedCount = flattenTree(pruned).length;

  return (
    prunedJson +
    `\n\n[Truncated: full tree has ${nodeCount} nodes, showing ${prunedCount} nodes at depth <= 3]`
  );
}
