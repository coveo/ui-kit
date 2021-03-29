import {TSDocParser} from '@microsoft/tsdoc';
import {buildEntity} from './entity-builder';

describe('#buildEntity', () => {
  it('when the docComment contains a summary, it sets the description to the text', () => {
    const parser = new TSDocParser();
    const {docComment} = parser.parseString(
      '/**\n * The number of pages to display in the pager.\n */\n'
    );

    const entity = buildEntity({
      name: 'numberOfPages',
      type: 'number',
      isOptional: true,
      comment: docComment,
    });

    expect(entity.desc).toBe('The number of pages to display in the pager.');
  });

  it(`when a docComment contains an @defaultValue tag,
  it sets the defaultValue to the default`, () => {
    const parser = new TSDocParser();
    const {docComment} = parser.parseString(
      '/**\n * The number of pages to display in the pager.\n *\n * @defaultValue `5`\n */\n'
    );

    const entity = buildEntity({
      name: 'numberOfPages',
      type: 'number',
      isOptional: true,
      comment: docComment,
    });

    expect(entity.defaultValue).toBe('`5`');
  });

  it(`when a docComment contains a summary and a non-standard tag (e.g. @default),
  it ignores the non-standard tag`, () => {
    const parser = new TSDocParser();
    const {docComment} = parser.parseString(
      '/**\n * The number of pages to display in the pager.\n *\n * @default 5\n */\n'
    );

    const entity = buildEntity({
      name: 'numberOfPages',
      type: 'number',
      isOptional: true,
      comment: docComment,
    });

    expect(entity.desc).toBe('The number of pages to display in the pager.');
  });
});
