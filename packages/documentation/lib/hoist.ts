import {normalize} from './normalize.js';
import type {TNavNode} from './types.js';

/**
 * Hoists any child whose title equals `fallbackCategory` so its children are promoted
 * to the *parent* level, at the exact position where the bucket appeared.
 * Runs depth-first so descendants are processed as well.
 */
export const hoistOtherCategoryInNav = (
  root: TNavNode,
  fallbackCategory: string
) => {
  if (!root) return;

  const stack: TNavNode[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    const kids = node.children;
    if (!Array.isArray(kids) || kids.length === 0) continue;

    const nextChildren: TNavNode[] = [];
    for (const child of kids) {
      const title = typeof child.text === 'string' ? child.text : undefined;
      if (title && normalize(title) === normalize(fallbackCategory)) {
        if (Array.isArray(child.children) && child.children.length) {
          // Promote grandchildren to the parent's level at this position
          nextChildren.push(...child.children);
        }
        // Drop the bucket itself
      } else {
        nextChildren.push(child);
      }
    }
    node.children = nextChildren;

    // Recurse
    for (const c of node.children) stack.push(c);
  }
};

/**
 * Top-level helper for themes that return navigation as an array of nodes.
 * If an element named like the fallback group exists at the root, its children are
 * spliced into the root array at the same index (i.e., promoted to the top level),
 * and the bucket is removed. Also applies recursive hoisting within all nodes.
 */
export const hoistOtherCategoryInArray = (
  rootItems: TNavNode[],
  fallbackCategory: string,
  topLevelGroup: string
) => {
  if (!Array.isArray(rootItems) || rootItems.length === 0) return;

  // First pass: recursively hoist 'Other' within each item
  for (const item of rootItems) {
    hoistOtherCategoryInNav(item, fallbackCategory);
  }

  // Second pass: hoist any top-level bucket matching either fallbackCategory ('Other')
  // or the requested top-level group (e.g., 'Documents').
  let i = 0;
  while (i < rootItems.length) {
    const item = rootItems[i];
    const title = typeof item.text === 'string' ? item.text : undefined;
    if (
      title &&
      (normalize(title) === normalize(fallbackCategory) ||
        normalize(title) === normalize(topLevelGroup))
    ) {
      const replacement = Array.isArray(item.children) ? item.children : [];
      // Replace the bucket node with its children (promote to top level)
      rootItems.splice(i, 1, ...replacement);
      // Continue at same index to handle multiple merges
      continue;
    }
    i++;
  }
};
