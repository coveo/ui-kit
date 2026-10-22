import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  areaOf,
  isPrefixAttribute,
  listElements,
  literalValuesOf,
  methodsOf,
  packageRoot,
  propertiesOf,
  TYPE_ALIASES,
} from './manifest.mjs';

describe('manifest', () => {
  describe('#listElements', () => {
    it('should keep the custom elements with their module path and area', () => {
      const manifest = {
        modules: [
          {
            path: 'src/components/search/atomic-facet/atomic-facet.ts',
            declarations: [
              {kind: 'class', name: 'Helper'},
              {kind: 'class', name: 'AtomicFacet', customElement: true, tagName: 'atomic-facet'},
            ],
          },
          {path: 'src/utils/utils.ts'},
        ],
      };
      expect(listElements(manifest)).toEqual([
        expect.objectContaining({
          tagName: 'atomic-facet',
          modulePath: 'src/components/search/atomic-facet/atomic-facet.ts',
          area: 'search',
        }),
      ]);
    });
  });

  describe('#areaOf', () => {
    it('should read the folder under src/components', () => {
      expect(areaOf('src/components/commerce/atomic-product-link/atomic-product-link.ts')).toBe(
        'commerce'
      );
    });
  });

  describe('#isPrefixAttribute', () => {
    it('should recognize a Record type, and the known bare names until the manifest types them', () => {
      expect(
        isPrefixAttribute({name: 'must-match', type: {text: 'Record<string, string[]>'}})
      ).toBe(true);
      expect(isPrefixAttribute({name: 'must-match'})).toBe(true);
      expect(isPrefixAttribute({name: 'depends-on'})).toBe(true);
      expect(isPrefixAttribute({name: 'icon'})).toBe(false);
      expect(isPrefixAttribute({name: 'field', type: {text: 'string'}})).toBe(false);
    });
  });

  describe('#propertiesOf and #methodsOf', () => {
    const element = {
      members: [
        {kind: 'field', name: 'dependsOn', description: 'Documented', privacy: 'public'},
        {kind: 'field', name: 'field', description: 'Has an attribute', attribute: 'field'},
        {kind: 'field', name: 'facet', privacy: 'public'},
        {kind: 'field', name: '_hidden', description: 'Underscore'},
        {kind: 'method', name: 'initialize', description: 'Documented', privacy: 'public'},
        {
          kind: 'method',
          name: 'injectStyles',
          description: 'From a mixin',
          inheritedFrom: {name: 'LightDomMixin'},
        },
        {kind: 'method', name: 'updateSearchHub'},
        {kind: 'method', name: 'secret', description: 'Private', privacy: 'private'},
        {kind: 'method', name: 'make', description: 'Static', static: true},
      ],
    };

    it('should keep the documented, own, public members without an attribute', () => {
      expect(propertiesOf(element).map((member) => member.name)).toEqual(['dependsOn']);
      expect(methodsOf(element).map((member) => member.name)).toEqual(['initialize']);
    });
  });

  describe('#literalValuesOf', () => {
    it('should list the literals of a union, and nothing for other types', () => {
      expect(literalValuesOf("'checkbox' | 'link' | 'box'")).toEqual(['checkbox', 'link', 'box']);
      expect(literalValuesOf('string')).toBeNull();
      expect(literalValuesOf("'a' | number")).toBeNull();
      expect(literalValuesOf(undefined)).toBeNull();
    });

    it('should expand the aliases the analyzer leaves unexpanded', () => {
      expect(literalValuesOf('Section')).toContain('facets');
    });
  });

  describe('TYPE_ALIASES', () => {
    it('should match the Section type of the sources', () => {
      const source = readFileSync(
        path.join(
          packageRoot,
          'src/components/common/atomic-layout-section/atomic-layout-section-utils.ts'
        ),
        'utf8'
      );
      const [, declaration] = /export type Section =([^;]+);/.exec(source);
      const values = [...declaration.matchAll(/'([^']+)'/g)].map((match) => match[1]);
      expect(literalValuesOf(TYPE_ALIASES.Section)).toEqual(values);
    });
  });
});
