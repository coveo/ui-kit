import {plugins} from '@vitest/pretty-format';
import {SnapshotSerializer} from 'vitest';

export default {
  test: (val: unknown) => val instanceof HTMLElement,
  serialize(val, config, indentation, depth, refs, printer) {
    const clone = val.cloneNode(true) as HTMLElement;
    const walker = document.createTreeWalker(clone);
    const comments: Comment[] = [];
    do {
      if (walker.currentNode.nodeType === Node.COMMENT_NODE) {
        comments.push(walker.currentNode as Comment);
      }
    } while (walker.nextNode());

    for (const comment of comments) {
      comment.parentNode?.removeChild(comment);
    }
    return plugins.DOMElement.serialize(
      clone,
      config,
      indentation,
      depth,
      refs,
      printer
    );
  },
} satisfies SnapshotSerializer;
