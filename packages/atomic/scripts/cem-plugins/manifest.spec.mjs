import {describe, expect, it} from 'vitest';
import {analyzeAtomic, findAttribute, findElement, findMember} from './testing/analyze.mjs';

describe('the custom elements manifest of Atomic', () => {
  const manifest = analyzeAtomic();
  const elements = manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement);

  it('should define each custom element once', () => {
    const tagNames = elements.map((element) => element.tagName);
    expect(tagNames.length).toBeGreaterThan(100);
    expect(new Set(tagNames).size).toBe(tagNames.length);
  });

  it('should export each custom element class and definition once', () => {
    for (const module of manifest.modules) {
      const definitions = module.exports.filter(
        (entry) => entry.kind === 'custom-element-definition'
      );
      if (definitions.length === 0) {
        continue;
      }
      expect(definitions, module.path).toHaveLength(1);
      expect(
        module.exports.filter(
          (entry) => entry.kind === 'js' && entry.name === definitions[0].declaration.name
        ),
        module.path
      ).toHaveLength(1);
    }
  });

  it('should back every attribute with a public field', () => {
    for (const element of elements) {
      for (const attribute of element.attributes ?? []) {
        const field = findMember(element, attribute.fieldName);
        expect(field, `${element.tagName} ${attribute.name}`).toMatchObject({kind: 'field'});
        expect(field.privacy, `${element.tagName} ${attribute.name}`).not.toBe('private');
      }
    }
  });

  it('should not type any attribute as possibly undefined', () => {
    for (const element of elements) {
      for (const attribute of element.attributes ?? []) {
        expect(attribute.type?.text ?? '', `${element.tagName} ${attribute.name}`).not.toContain(
          'undefined'
        );
      }
    }
  });

  it('should expose the @mapProperty attributes the stories and the Angular wrapper rely on', () => {
    expect(findAttribute(findElement(manifest, 'atomic-facet'), 'depends-on')).toMatchObject({
      fieldName: 'dependsOn',
    });
    expect(
      findAttribute(findElement(manifest, 'atomic-result-template'), 'must-match')
    ).toMatchObject({
      fieldName: 'mustMatch',
    });
    expect(
      findAttribute(findElement(manifest, 'atomic-result-template'), 'must-not-match')
    ).toMatchObject({
      fieldName: 'mustNotMatch',
    });
    expect(
      findAttribute(findElement(manifest, 'atomic-result-localized-text'), 'field')
    ).toMatchObject({
      fieldName: 'field',
    });
  });

  it('should leave out @internal components', () => {
    expect(findElement(manifest, 'atomic-modal')).toBeUndefined();
    expect(findElement(manifest, 'atomic-tab-bar')).toBeUndefined();
  });

  it('should keep a property public when another component binds a controller of the same name', () => {
    const element = findElement(manifest, 'atomic-insight-interface');
    expect(findMember(element, 'resultsPerPage').privacy).not.toBe('private');
    expect(findAttribute(element, 'results-per-page')).toBeDefined();
  });

  it('should expose both inputs of atomic-component-error', () => {
    const element = findElement(manifest, 'atomic-component-error');
    expect(findAttribute(element, 'element')).toBeDefined();
    expect(findAttribute(element, 'error')).toBeDefined();
  });

  it('should only export custom elements, each once', () => {
    for (const module of manifest.modules) {
      const keys = module.exports.map(
        ({kind, name, declaration}) =>
          `${kind}:${name}:${declaration.name}:${declaration.module ?? ''}`
      );
      expect(new Set(keys).size, module.path).toBe(keys.length);
      const definedElements = module.exports
        .filter((entry) => entry.kind === 'custom-element-definition')
        .map((entry) => entry.declaration.name);
      for (const entry of module.exports) {
        expect(definedElements, `${module.path} exports ${entry.kind} ${entry.name}`).toContain(
          entry.declaration.name
        );
      }
    }
  });
});
