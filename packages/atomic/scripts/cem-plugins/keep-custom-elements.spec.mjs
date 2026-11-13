import {describe, expect, it} from 'vitest';
import {keepCustomElementsPlugin} from './keep-custom-elements.mjs';
import {analyze, findElement, findMember, findModule, litElement} from './testing/analyze.mjs';

const plugins = () => [keepCustomElementsPlugin()];

const exportsOf = (module) =>
  module.exports.map(({kind, name, declaration}) => `${kind}:${name}->${declaration.name}`).sort();

describe('keepCustomElementsPlugin', () => {
  it('should keep the class and definition exports of a custom element', () => {
    const manifest = analyze({'src/x-foo.ts': litElement('x-foo', 'XFoo', '')}, plugins());

    expect(exportsOf(findModule(manifest, 'src/x-foo.ts'))).toEqual([
      'custom-element-definition:x-foo->XFoo',
      'js:XFoo->XFoo',
    ]);
    expect(findElement(manifest, 'x-foo')).toBeDefined();
  });

  it('should drop an @internal custom element', () => {
    const manifest = analyze(
      {
        'src/x-internal.ts': `
import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * @internal
 */
@customElement('x-internal')
export class XInternal extends LitElement {}
`,
      },
      plugins()
    );

    expect(findElement(manifest, 'x-internal')).toBeUndefined();
    expect(findModule(manifest, 'src/x-internal.ts').exports).toEqual([]);
  });

  it('should drop exports that are not custom elements', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': `${litElement('x-foo', 'XFoo', '')}
export function helper() {}
export const DEFAULT_VALUE = 1;
`,
        'src/utils.ts': `
export class Helper {}
export * from './x-foo';
`,
      },
      plugins()
    );

    expect(exportsOf(findModule(manifest, 'src/x-foo.ts'))).toEqual([
      'custom-element-definition:x-foo->XFoo',
      'js:XFoo->XFoo',
    ]);
    expect(findModule(manifest, 'src/utils.ts').exports).toEqual([]);
    expect(findModule(manifest, 'src/utils.ts').declarations).toEqual([]);
  });

  it('should keep the members a custom element inherits from a mixin', () => {
    const manifest = analyze(
      {
        'src/mixin.ts': `
export const WithGreeting = (superClass) =>
  class extends superClass {
    public greet() {}
  };
`,
        'src/x-foo.ts': `
import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {WithGreeting} from './mixin';

@customElement('x-foo')
export class XFoo extends WithGreeting(LitElement) {}
`,
      },
      plugins()
    );

    expect(findMember(findElement(manifest, 'x-foo'), 'greet')).toMatchObject({
      kind: 'method',
      inheritedFrom: {name: 'WithGreeting'},
    });
  });
});
