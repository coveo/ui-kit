import {normalize} from './normalize.js';
import type {TNavNode} from './types.js';

export const applyTopLevelRenameArray = (
  items: TNavNode[],
  from: string,
  to: string
) => {
  if (!Array.isArray(items) || items.length === 0) return;
  const fromN = normalize(from);
  for (const item of items) {
    const t = typeof item.text === 'string' ? item.text : undefined;
    if (t && normalize(t) === fromN) item.text = to;
  }
};
