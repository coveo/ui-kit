import {TSDocParser} from '@microsoft/tsdoc';
import {emitAsTsDoc} from './tsdoc-emitter';

describe('#emitAsTsDoc', () => {
  it('when the summary is plain text, it emits a string', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString('/**\n * Creates a Pager.\n */\n');

    const result = emitAsTsDoc(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a Pager.');
  });

  it('when the summary has a monotype, it wraps the code with backticks', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString('/**\n * Creates a `Pager`.\n */\n');

    const result = emitAsTsDoc(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a `Pager`.');
  });

  it('when the summary has multiple paragraphs, it inserts newlines between them but not at the end', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString(
      '/**\n * Creates a `Pager`.\n *\n * Note: test note.\n */\n'
    );

    const result = emitAsTsDoc(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a `Pager`.\n\nNote: test note.');
  });
});
