import {
  DocCodeSpan,
  DocNode,
  DocNodeKind,
  DocNodeTransforms,
  DocParagraph,
  DocPlainText,
} from '@microsoft/tsdoc';

export function emit(nodes: readonly DocNode[]) {
  return nodes.map(emitNode).join('');
}

function emitNode(node: DocNode): string {
  const {kind} = node;

  if (kind === DocNodeKind.Paragraph) {
    const trimmed = DocNodeTransforms.trimSpacesInParagraph(
      node as DocParagraph
    );
    return emit(trimmed.nodes);
  }

  if (kind === DocNodeKind.PlainText) {
    return (node as DocPlainText).text;
  }

  if (kind === DocNodeKind.CodeSpan) {
    const {code} = node as DocCodeSpan;
    return `\`${code}\``;
  }

  throw new Error(`Unsupported DocNode kind: ${node.kind}`);
}
