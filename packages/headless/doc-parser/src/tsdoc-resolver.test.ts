import {TSDocParser} from '@microsoft/tsdoc';
import {resolveNodes} from './tsdoc-resolver';

describe('#resolveNodes', () => {
  it('resolves a plain text string', () => {
    const parser = new TSDocParser();
    const ast = parser.parseString('/**\n * Creates a Pager.\n */\n');

    const result = resolveNodes(ast.docComment.summarySection.nodes);
    expect(result).toBe('Creates a Pager.');
  });
});
