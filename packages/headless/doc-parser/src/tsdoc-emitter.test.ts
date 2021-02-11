import {TSDocParser} from '@microsoft/tsdoc';
import {emit} from './tsdoc-emitter';

describe('#emit', () => {
  it('when the doc is plain text, it emits a string', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString('/**\n * Creates a Pager.\n */\n');

    const result = emit(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a Pager.');
  });

  it('when the doc has a monotype, it wraps the code with backticks', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString('/**\n * Creates a `Pager`.\n */\n');

    const result = emit(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a `Pager`.');
  });
});
