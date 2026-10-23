import {describe, expect, it} from 'vitest';
import {mapPropertyPlugin} from './map-property.mjs';
import {analyze, findAttribute, findElement, findMember, litElement} from './testing/analyze.mjs';

const plugins = () => [mapPropertyPlugin()];

const dependsOn = `
  /**
   * The facets this facet depends on.
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn: Record<string, string> = {};
`;

describe('mapPropertyPlugin', () => {
  it('should expose a @mapProperty field as an attribute named after its prefix', () => {
    const manifest = analyze({'src/x-foo.ts': litElement('x-foo', 'XFoo', dependsOn)}, plugins());

    expect(findAttribute(findElement(manifest, 'x-foo'), 'depends-on')).toEqual({
      name: 'depends-on',
      fieldName: 'dependsOn',
      type: {text: 'Record<string, string>'},
      description: 'The facets this facet depends on.',
      default: '{}',
    });
    expect(findMember(findElement(manifest, 'x-foo'), 'dependsOn').attribute).toBe('depends-on');
  });

  it('should read the prefix when other options come first', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  public mustMatch: Record<string, string[]> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'must-match')).toMatchObject({
      fieldName: 'mustMatch',
      type: {text: 'Record<string, string[]>'},
    });
  });

  it('should name the attribute after the field when there is no prefix', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @mapProperty() public mustNotMatch: Record<string, string[]> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'must-not-match')).toMatchObject({
      fieldName: 'mustNotMatch',
    });
  });

  it('should find the decorator among others', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @mapProperty({attributePrefix: 'depends-on'}) @state() public dependsOn: Record<string, string> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'depends-on')).toBeDefined();
  });

  it('should attach the attribute to the class that declares the field', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': `
function helper() {}

export class Helper {}
${litElement('x-foo', 'XFoo', dependsOn)}
`,
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'depends-on')).toBeDefined();
  });

  it('should not expose an @internal field', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  /**
   * @internal
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn: Record<string, string> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'depends-on')).toBeUndefined();
  });

  it('should read the prefix in any string literal, under a quoted key too', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @mapProperty({attributePrefix: \`depends-on\`}) public dependsOn: Record<string, string> = {};
  @mapProperty({'attributePrefix': 'must-match'}) public mustMatch: Record<string, string[]> = {};
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findAttribute(element, 'depends-on')).toMatchObject({fieldName: 'dependsOn'});
    expect(findAttribute(element, 'must-match')).toMatchObject({fieldName: 'mustMatch'});
  });

  it('should name the attribute after the field when the prefix is empty, like the decorator', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @mapProperty({attributePrefix: ''}) public mustNotMatch: Record<string, string[]> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'must-not-match')).toMatchObject({
      fieldName: 'mustNotMatch',
    });
  });

  it('should fail on a prefix it cannot read, rather than name the attribute wrongly', () => {
    const sources = {
      'src/x-foo.ts': litElement(
        'x-foo',
        'XFoo',
        `
  @mapProperty({attributePrefix: PREFIX}) public dependsOn: Record<string, string> = {};
`
      ),
    };

    expect(() => analyze(sources, plugins())).toThrow(/Cannot read the attribute prefix/);
  });

  it('should fail on a field outside a top-level class, such as in a mixin', () => {
    const sources = {
      'src/mixin.ts': `
export const DependsOnMixin = (superClass) => {
  class DependsOnMixinClass extends superClass {
    @mapProperty({attributePrefix: 'depends-on'}) public dependsOn: Record<string, string> = {};
  }
  return DependsOnMixinClass;
};
`,
    };

    expect(() => analyze(sources, plugins())).toThrow(
      /only supported on the fields of a top-level class/
    );
  });
});
