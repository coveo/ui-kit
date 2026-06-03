import {normalize} from './normalize.js';
import type {TNavNode} from './types.js';

// Top-level & nested ordering utilities
export const applyTopLevelOrderingArray = (
  items: TNavNode[],
  order: string[]
) => {
  if (!Array.isArray(items) || items.length === 0 || !order?.length) return;
  const spec = order.map((s) => normalize(s));
  const wildcard = spec.indexOf('*');

  items.sort((a, b) => rankCompare(a, b, spec, wildcard));
};

export const applyTopLevelOrderingNode = (root: TNavNode, order: string[]) => {
  if (!root?.children?.length) return;
  applyTopLevelOrderingArray(root.children, order);
};

// Nested ordering: if `order` is provided, apply rank-based ordering at every level;
// otherwise sort alphabetically by `text`. Always recurse into children.
export const applyNestedOrderingNode = (
  root: TNavNode,
  orderMap?: Record<string, string[]>,
  keyPrefix?: string
) => {
  if (!root) return;
  if (Array.isArray(root.children) && root.children.length) {
    const key = [keyPrefix, normalize(String(root.text ?? ''))]
      .join(' ')
      .trim();
    const spec = orderMap && (orderMap[key] || orderMap['*']);
    if (spec?.length) applyOrderingArray(root.children, spec);
    else root.children.sort(alphaByText);
    for (const c of root.children) applyNestedOrderingNode(c, orderMap, key);
  }
};

export const applyNestedOrderingArray = (
  items: TNavNode[],
  orderMap?: Record<string, string[]>
) => {
  if (!Array.isArray(items) || items.length === 0) return;
  for (const item of items) applyNestedOrderingNode(item, orderMap);
};

const applyOrderingArray = (items: TNavNode[], order: string[]) => {
  const spec = order.map((s) => normalize(s));
  const wildcard = spec.indexOf('*');
  items.sort((a, b) => rankCompare(a, b, spec, wildcard));
};

const rankCompare = (
  a: TNavNode,
  b: TNavNode,
  spec: string[],
  wildcardIdx: number
) => {
  const an = normalize(String(a.text ?? ''));
  const bn = normalize(String(b.text ?? ''));
  const ar = spec.indexOf(an);
  const br = spec.indexOf(bn);

  const aRank = ar >= 0 ? ar : wildcardIdx >= 0 ? wildcardIdx : spec.length;
  const bRank = br >= 0 ? br : wildcardIdx >= 0 ? wildcardIdx : spec.length;

  if (aRank !== bRank) return aRank - bRank;
  return an.localeCompare(bn);
};

const alphaByText = (a: TNavNode, b: TNavNode) => {
  return normalize(String(a.text ?? '')).localeCompare(
    normalize(String(b.text ?? ''))
  );
};
