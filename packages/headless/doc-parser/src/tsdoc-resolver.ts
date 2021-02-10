import {
  DocNode,
  DocNodeKind,
  DocNodeTransforms,
  DocParagraph,
  DocPlainText,
} from '@microsoft/tsdoc';

export function resolveNodes(nodes: readonly DocNode[]) {
  return nodes.map(resolveNode).join(' ');
}

function resolveNode(node: DocNode): string {
  const {kind} = node;

  if (kind === DocNodeKind.Paragraph) {
    const trimmed = DocNodeTransforms.trimSpacesInParagraph(
      node as DocParagraph
    );
    return resolveNodes(trimmed.nodes);
  }

  if (kind === DocNodeKind.PlainText) {
    return (node as DocPlainText).text;
  }

  throw new Error(`Unsupported DocNode kind: ${node.kind}`);
}
