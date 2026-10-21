import {beforeAll, describe, expect, it} from 'vitest';
import {
  analyzeAtomic,
  findAttribute,
  findDecoratedFields,
  findElement,
  findMember,
} from './testing/analyze.mjs';

describe('the custom elements manifest of Atomic', () => {
  let manifest;
  let elements;

  beforeAll(async () => {
    manifest = await analyzeAtomic();
    elements = manifest.modules
      .flatMap((module) => module.declarations ?? [])
      .filter((declaration) => declaration.customElement);
  });

  const decoratedElementFields = (decoratorName) =>
    manifest.modules.flatMap((module) => {
      const elementsByName = new Map(
        (module.declarations ?? [])
          .filter((declaration) => declaration.customElement)
          .map((element) => [element.name, element])
      );
      if (elementsByName.size === 0) {
        return [];
      }
      return findDecoratedFields(module.path, decoratorName)
        .filter(({className}) => elementsByName.has(className))
        .map((field) => ({...field, element: elementsByName.get(field.className)}));
    });

  const isHidden = (element, name) => {
    const member = findMember(element, name);
    return !member || member.privacy === 'private';
  };

  const hasAttribute = (element, fieldName) =>
    element.attributes?.some((attribute) => attribute.fieldName === fieldName) ?? false;

  it('should list the modules sorted by path, so that every build is identical', () => {
    const paths = manifest.modules.map((module) => module.path);
    expect(paths).toEqual(paths.toSorted());
  });

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

  it('should hide the fields every component gets from InitializableComponent, unless they are inputs', () => {
    for (const element of elements) {
      for (const name of ['bindings', 'initialized', 'unsubscribeLanguage', 'error']) {
        expect(
          isHidden(element, name) || hasAttribute(element, name),
          `${element.tagName} ${name}`
        ).toBe(true);
      }
    }
  });

  it('should expose both inputs of atomic-component-error', () => {
    const element = findElement(manifest, 'atomic-component-error');
    expect(findAttribute(element, 'element')).toMatchObject({fieldName: 'element'});
    expect(findAttribute(element, 'error')).toMatchObject({fieldName: 'error'});
  });

  it('should hide each @bindStateToController field and the controller it is bound to', () => {
    const boundFields = decoratedElementFields('bindStateToController');
    expect(boundFields).not.toHaveLength(0);
    for (const {element, fieldName, firstArgument} of boundFields) {
      for (const name of [fieldName, firstArgument.text]) {
        expect(isHidden(element, name), `${element.tagName} ${name}`).toBe(true);
        expect(hasAttribute(element, name), `${element.tagName} ${name}`).toBe(false);
      }
    }
  });

  it('should expose each @mapProperty field as an attribute', () => {
    const mappedFields = decoratedElementFields('mapProperty');
    expect(mappedFields).not.toHaveLength(0);
    for (const {element, fieldName} of mappedFields) {
      expect(hasAttribute(element, fieldName), `${element.tagName} ${fieldName}`).toBe(true);
    }
  });

  it('should name the @mapProperty attributes the stories and the Angular wrapper rely on after their prefix', () => {
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
});
