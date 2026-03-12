import type {AccessibilityNode, BoundingBox, PlaywrightPage} from './types.js';

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

// ---------------------------------------------------------------------------
// Bounding box collection + annotation
// ---------------------------------------------------------------------------

interface DOMElementBox {
  role: string;
  name: string;
  bbox: BoundingBox;
}

/**
 * Run in the browser context: walk the DOM collecting bounding boxes for every
 * element that would appear in the accessibility tree. Returns a flat list of
 * {role, name, bbox} entries keyed the same way Playwright's a11y snapshot
 * reports nodes.
 */
function collectBoundingBoxesInPage(): DOMElementBox[] {
  const IMPLICIT_ROLES: Record<string, string> = {
    A: 'link',
    BUTTON: 'button',
    H1: 'heading',
    H2: 'heading',
    H3: 'heading',
    H4: 'heading',
    H5: 'heading',
    H6: 'heading',
    IMG: 'img',
    INPUT: 'textbox',
    SELECT: 'combobox',
    TEXTAREA: 'textbox',
    NAV: 'navigation',
    MAIN: 'main',
    HEADER: 'banner',
    FOOTER: 'contentinfo',
    ASIDE: 'complementary',
    FORM: 'form',
    TABLE: 'table',
    UL: 'list',
    OL: 'list',
    LI: 'listitem',
    SECTION: 'region',
    DIALOG: 'dialog',
    DETAILS: 'group',
    SUMMARY: 'button',
  };

  function getAccessibleName(el: Element): string {
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const parts = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean);
      if (parts.length) return parts.join(' ');
    }

    if (el.tagName === 'IMG') {
      return (el as HTMLImageElement).alt || '';
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      const id = el.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent?.trim() || '';
      }
      return el.getAttribute('placeholder')?.trim() || '';
    }

    // For leaf-ish elements, use direct text content (avoid huge subtree text)
    const directText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    return directText.slice(0, 200);
  }

  const results: DOMElementBox[] = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        const el = node as Element;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current = walker.currentNode as Element;
  while (current) {
    if (current instanceof Element) {
      const explicitRole = current.getAttribute('role');
      const implicitRole = IMPLICIT_ROLES[current.tagName];
      const role = explicitRole || implicitRole;

      if (role) {
        const rect = current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push({
            role,
            name: getAccessibleName(current),
            bbox: {
              x: Math.round(rect.x),
              y: Math.round(rect.y + window.scrollY),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          });
        }
      }
    }
    const next = walker.nextNode();
    if (!next) break;
    current = next as Element;
  }

  return results;
}

/**
 * Collect bounding boxes for all visible elements with ARIA roles on the page.
 */
export async function collectBoundingBoxes(
  page: PlaywrightPage
): Promise<DOMElementBox[]> {
  try {
    return await page.evaluate(collectBoundingBoxesInPage);
  } catch {
    return [];
  }
}

/**
 * Walk the accessibility tree and attach bounding boxes from the DOM collection.
 *
 * Matching strategy: role + trimmed name (case-insensitive). When multiple DOM
 * elements share the same role+name, bboxes are consumed in DOM order — which
 * typically matches the a11y tree order.
 */
export function annotateBoundingBoxes(
  tree: AccessibilityNode | null,
  domBoxes: DOMElementBox[]
): void {
  if (!tree || domBoxes.length === 0) return;

  // Build a map of role+name → list of bboxes (in DOM order)
  const boxMap = new Map<string, BoundingBox[]>();
  for (const entry of domBoxes) {
    const key = `${entry.role.toLowerCase()}|${entry.name.toLowerCase().trim()}`;
    const existing = boxMap.get(key);
    if (existing) {
      existing.push(entry.bbox);
    } else {
      boxMap.set(key, [entry.bbox]);
    }
  }

  function walk(node: AccessibilityNode): void {
    const role = (node.role || '').toLowerCase();
    const name = (node.name || '').toLowerCase().trim();
    const key = `${role}|${name}`;

    const boxes = boxMap.get(key);
    if (boxes && boxes.length > 0) {
      node.bbox = boxes.shift()!;
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(tree);
}
