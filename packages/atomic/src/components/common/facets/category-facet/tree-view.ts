export const categoryFacetTreeItemSelector = '[role="treeitem"]';
const categoryFacetTreePathSeparator = '\u001f';

export interface CategoryFacetTreeNode {
  path: string[];
  children: CategoryFacetTreeNode[];
}

export function getCategoryFacetTreeItems(
  root: ParentNode | null
): HTMLElement[] {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(categoryFacetTreeItemSelector)
  );
}

export function getCategoryFacetTreeItemLevel(item: Element): number {
  return Number(item.getAttribute('aria-level') ?? '1');
}

export function findParentCategoryFacetTreeItem(
  items: HTMLElement[],
  startIndex: number
): HTMLElement | undefined {
  const currentLevel = getCategoryFacetTreeItemLevel(items[startIndex]);

  for (let i = startIndex - 1; i >= 0; i--) {
    if (getCategoryFacetTreeItemLevel(items[i]) === currentLevel - 1) {
      return items[i];
    }
  }

  return undefined;
}

export function findFirstChildCategoryFacetTreeItem(
  items: HTMLElement[],
  startIndex: number
): HTMLElement | undefined {
  const nextItem = items[startIndex + 1];
  if (!nextItem) {
    return undefined;
  }

  return getCategoryFacetTreeItemLevel(nextItem) ===
    getCategoryFacetTreeItemLevel(items[startIndex]) + 1
    ? nextItem
    : undefined;
}

export function setActiveCategoryFacetTreeItem(
  root: ParentNode | null,
  activeTreeItem: HTMLElement | null
) {
  for (const item of getCategoryFacetTreeItems(root)) {
    item.tabIndex = item === activeTreeItem ? 0 : -1;
  }
}

export function serializeCategoryFacetTreePath(path: string[]) {
  return path.join(categoryFacetTreePathSeparator);
}

export function deserializeCategoryFacetTreePath(path: string) {
  return path.split(categoryFacetTreePathSeparator);
}

export function findCategoryFacetTreeNodeByPath<
  T extends CategoryFacetTreeNode,
>(nodes: T[], path: string[]): T | undefined {
  for (const node of nodes) {
    if (
      node.path.length === path.length &&
      node.path.every((part, index) => part === path[index])
    ) {
      return node;
    }

    const match = findCategoryFacetTreeNodeByPath(node.children as T[], path);
    if (match) {
      return match;
    }
  }

  return undefined;
}
