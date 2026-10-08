import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  analyzeModule,
  findPackageDependencyGaps,
  findUnregisteredRenderedTags,
} from './element-dependencies.mjs';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe('element dependencies', () => {
  it('should register every atomic-* tag an element renders within its own import graph', () => {
    const gaps = findPackageDependencyGaps(packageRoot).map(
      ({element, tag, renderedBy}) =>
        `${element} renders <${tag}> (in ${renderedBy}) without importing it`
    );

    expect(
      gaps,
      "Add a side-effect import of the rendered element to the module that renders it, e.g. `import '@/src/components/common/atomic-icon/atomic-icon.js';`"
    ).toEqual([]);
  });

  describe('#analyzeModule', () => {
    it('should collect registered tags', () => {
      const {registers} = analyzeModule(
        'a.ts',
        "@customElement('atomic-a') class A extends LitElement {}"
      );

      expect(registers).toEqual(['atomic-a']);
    });

    it('should collect tags rendered in html templates', () => {
      const {renders} = analyzeModule('a.ts', 'html`<atomic-icon icon=${x}></atomic-icon>`');

      expect([...renders]).toEqual(['atomic-icon']);
    });

    it('should collect tags passed to createElement', () => {
      const {renders} = analyzeModule('a.ts', "document.createElement('atomic-modal');");

      expect([...renders]).toEqual(['atomic-modal']);
    });

    it('should collect tags in markup strings', () => {
      const {renders} = analyzeModule(
        'a.ts',
        'el.innerHTML = `<atomic-result-link>${x}</atomic-result-link>`;'
      );

      expect([...renders]).toEqual(['atomic-result-link']);
    });

    it('should ignore messages that mention a tag', () => {
      const {renders} = analyzeModule(
        'a.ts',
        "throw new Error('The facet property is required for <atomic-facet>.');"
      );

      expect([...renders]).toEqual([]);
    });

    it('should ignore dynamic imports', () => {
      const {imports} = analyzeModule(
        'a.ts',
        [
          "import './static.js';",
          "export {B} from './re-export.js';",
          "export const loadChild = () => import('./child.js');",
        ].join('\n')
      );

      expect(imports).toEqual(['./static.js', './re-export.js']);
    });

    it('should ignore type-only imports', () => {
      const {imports} = analyzeModule(
        'a.ts',
        [
          "import type {A} from './a-type.js';",
          "import {B} from './b-type-usage.js';",
          "import {C} from './c-value.js';",
          "import './d-side-effect.js';",
          'let b: B;',
          'C();',
        ].join('\n')
      );

      expect(imports).toEqual(['./c-value.js', './d-side-effect.js']);
    });
  });

  describe('#findUnregisteredRenderedTags', () => {
    const resolveImport = (_from, specifier) => specifier;

    it('should report a rendered tag that nothing in the import graph registers', () => {
      const modules = new Map([
        ['parent', {imports: ['render'], registers: ['atomic-parent'], renders: new Set()}],
        ['render', {imports: [], registers: [], renders: new Set(['atomic-child'])}],
        ['child', {imports: [], registers: ['atomic-child'], renders: new Set()}],
      ]);

      expect(findUnregisteredRenderedTags(modules, resolveImport)).toEqual([
        {element: 'atomic-parent', tag: 'atomic-child', renderedBy: 'render'},
      ]);
    });

    it('should report a rendered tag whose element is only imported lazily', () => {
      const parentCode = [
        "export const loadChild = () => import('child');",
        'html`<atomic-child></atomic-child>`;',
        "@customElement('atomic-parent') class Parent extends LitElement {}",
      ].join('\n');
      const modules = new Map([
        ['parent', analyzeModule('parent.ts', parentCode)],
        [
          'child',
          analyzeModule(
            'child.ts',
            "@customElement('atomic-child') class Child extends LitElement {}"
          ),
        ],
      ]);

      expect(findUnregisteredRenderedTags(modules, resolveImport)).toEqual([
        {element: 'atomic-parent', tag: 'atomic-child', renderedBy: 'parent'},
      ]);
    });

    it('should accept a rendered tag registered through a transitive import', () => {
      const modules = new Map([
        ['parent', {imports: ['render'], registers: ['atomic-parent'], renders: new Set()}],
        ['render', {imports: ['child'], registers: [], renders: new Set(['atomic-child'])}],
        ['child', {imports: [], registers: ['atomic-child'], renders: new Set()}],
      ]);

      expect(findUnregisteredRenderedTags(modules, resolveImport)).toEqual([]);
    });

    it('should ignore tags that are not Atomic elements', () => {
      const modules = new Map([
        [
          'parent',
          {imports: [], registers: ['atomic-parent'], renders: new Set(['atomic-unknown'])},
        ],
      ]);

      expect(findUnregisteredRenderedTags(modules, resolveImport)).toEqual([]);
    });
  });
});
