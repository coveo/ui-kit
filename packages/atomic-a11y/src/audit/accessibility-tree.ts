import type {AccessibilityNode} from './types.js';

export type {AccessibilityNode};

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

function nodeKey(node: AccessibilityNode): string {
  return `${node.role || ''}|${node.name || ''}|${node.value || ''}|${node.description || ''}`;
}

export function diffAccessibilityTrees(
  before: AccessibilityNode | null,
  after: AccessibilityNode | null
): AccessibilityNode[] {
  const beforeKeys = new Set(flattenTree(before).map(nodeKey));
  const afterNodes = flattenTree(after);
  return afterNodes.filter((node) => !beforeKeys.has(nodeKey(node)));
}

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
      .filter(Boolean) as AccessibilityNode[];
  }

  return result;
}

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
