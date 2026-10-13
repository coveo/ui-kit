import {describe, expect, it} from 'vitest';
import {mapPropertyPlugin} from '../cem-plugin.mjs';
import {analyze, findAttribute, findElement, litElement} from './testing/analyze.mjs';

const plugins = () => [mapPropertyPlugin()];

describe('mapPropertyPlugin', () => {
  it('should expose a @mapProperty field as an attribute named after its prefix', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  /**
   * The facets this facet depends on.
   */
  @mapProperty({attributePrefix: 'depends-on'})
  public dependsOn: Record<string, string> = {};
`
        ),
      },
      plugins()
    );

    expect(findAttribute(findElement(manifest, 'x-foo'), 'depends-on')).toMatchObject({
      fieldName: 'dependsOn',
    });
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
    });
  });
});
