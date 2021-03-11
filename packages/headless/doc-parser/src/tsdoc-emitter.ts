import {
  DocCodeSpan,
  DocNode,
  DocNodeKind,
  DocNodeTransforms,
  DocParagraph,
  DocPlainText,
} from '@microsoft/tsdoc';

export function emitAsTsDoc(nodes: readonly DocNode[]) {
  return nodes.map(emitNode).join('').trim();
}

function emitNode(node: DocNode): string {
  if (isParagraph(node)) {
    const trimmed = DocNodeTransforms.trimSpacesInParagraph(node);
    return emitAsTsDoc(trimmed.nodes) + '\n\n';
  }

  if (isPlainText(node)) {
    return node.text;
  }

  if (isCodeSpan(node)) {
    return `\`${node.code}\``;
  }

  throw new Error(`Unsupported DocNode kind: ${node.kind}`);
}

function isParagraph(node: DocNode): node is DocParagraph {
  return node.kind === DocNodeKind.Paragraph;
}

function isPlainText(node: DocNode): node is DocPlainText {
  return node.kind === DocNodeKind.PlainText;
}

function isCodeSpan(node: DocNode): node is DocCodeSpan {
  return node.kind === DocNodeKind.CodeSpan;
}
