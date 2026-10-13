import {describe, expect, it} from 'vitest';
import {keepCustomElementExportsPlugin} from './keep-custom-element-exports.mjs';
import {analyze, findElement, findMember, findModule, litElement} from './testing/analyze.mjs';

const plugins = () => [keepCustomElementExportsPlugin()];

const exportsOf = (module) =>
  module.exports.map(({kind, name, declaration}) => `${kind}:${name}->${declaration.name}`).sort();

describe('keepCustomElementExportsPlugin', () => {
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

  it('should drop overloaded functions instead of duplicating their exports', () => {
    const manifest = analyze(
      {
        'src/utils.ts': `
export function closest(element: Element, selector: string): Element | null;
export function closest(element: Node, selector: string): Node | null;
export function closest(element: Node, selector: string) {
  return null;
}
`,
      },
      plugins()
    );

    expect(findModule(manifest, 'src/utils.ts').exports).toEqual([]);
    expect(findModule(manifest, 'src/utils.ts').declarations).toEqual([]);
  });

  it('should drop barrel re-exports instead of duplicating them', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement('x-foo', 'XFoo', ''),
        'src/x-bar.ts': litElement('x-bar', 'XBar', ''),
        'src/x-baz.ts': litElement('x-baz', 'XBaz', ''),
        'src/index.ts': `
export * from './x-foo';
export * from './x-bar';
export * from './x-baz';
`,
      },
      plugins()
    );

    expect(findModule(manifest, 'src/index.ts').exports).toEqual([]);
    expect(findElement(manifest, 'x-baz')).toBeDefined();
  });

  it('should drop type alias exports', () => {
    const manifest = analyze(
      {
        'src/index.ts': `
import type {Components as _Components} from './components';
export type {_Components as Components, _Components as JSX};
`,
      },
      plugins()
    );

    expect(findModule(manifest, 'src/index.ts').exports).toEqual([]);
  });
});
