import {describe, expect, it} from 'vitest';
import {removeUndefinedTypePlugin} from './remove-undefined-type.mjs';
import {analyze, findAttribute, findElement, findMember, litElement} from './testing/analyze.mjs';

const plugins = () => [removeUndefinedTypePlugin()];

describe('removeUndefinedTypePlugin', () => {
  const sources = {
    'src/x-foo.ts': litElement(
      'x-foo',
      'XFoo',
      `
  @property({type: String}) label?: string;
  @property({type: String}) kind?: 'a' | 'b';
  @property({type: String}) separator?: '|' | ',';
  @property({type: Object, attribute: false}) engine?: Engine;
`
    ),
  };

  it('should remove undefined from attribute types', () => {
    const element = findElement(analyze(sources, plugins()), 'x-foo');
    expect(findAttribute(element, 'label').type.text).toBe('string');
  });

  it('should keep the other members of a union', () => {
    const element = findElement(analyze(sources, plugins()), 'x-foo');
    expect(findAttribute(element, 'kind').type.text).toBe("'a' | 'b'");
  });

  it('should keep a | that is part of a member of the union', () => {
    const element = findElement(analyze(sources, plugins()), 'x-foo');
    expect(findAttribute(element, 'separator').type.text).toBe("'|' | ','");
  });

  it('should also strip the type of the field behind the attribute', () => {
    const element = findElement(analyze(sources, plugins()), 'x-foo');
    expect(findMember(element, 'label').type.text).toBe('string');
  });

  it('should leave fields without an attribute alone', () => {
    const element = findElement(analyze(sources, plugins()), 'x-foo');
    expect(findMember(element, 'engine').type.text).toBe('Engine | undefined');
  });
});
