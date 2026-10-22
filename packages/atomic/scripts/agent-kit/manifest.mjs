import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
export const manifestPath = path.join(packageRoot, 'custom-elements.json');

export function readManifest(file = manifestPath) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * The area of a component, from its folder under `src/components/`.
 *
 * @param {string} modulePath
 */
export function areaOf(modulePath) {
  const [, , area] = modulePath.split('/');
  return area;
}

/**
 * Lists the custom elements of a manifest, each with the path and area of its module.
 *
 * @param {object} manifest
 */
export function listElements(manifest) {
  return manifest.modules.flatMap((module) =>
    (module.declarations ?? [])
      .filter((declaration) => declaration.customElement && declaration.tagName)
      .map((element) => ({...element, modulePath: module.path, area: areaOf(module.path)}))
  );
}

export function indexByTag(elements) {
  return new Map(elements.map((element) => [element.tagName, element]));
}

/**
 * A member that belongs to the component's own API: declared on its class rather than on a
 * mixin or base class, public, and documented.
 */
const isOwnApi = (member) =>
  member.privacy !== 'private' &&
  member.privacy !== 'protected' &&
  !member.static &&
  !member.inheritedFrom &&
  Boolean(member.description) &&
  !member.name.startsWith('_');

/**
 * The attributes an element accepts in HTML.
 */
export function attributesOf(element) {
  return element.attributes ?? [];
}

/**
 * Until the manifest types the `@mapProperty` attributes (KIT-4838), they reach it without a
 * type, so the known prefixes are listed here.
 */
const BARE_PREFIX_ATTRIBUTES = new Set(['must-match', 'must-not-match', 'depends-on', 'field']);

/**
 * The attributes whose name is a prefix: `must-match` accepts `must-match-<field>`.
 * The analyzer gives them a `Record<…>` type.
 */
export function prefixAttributesOf(element) {
  return attributesOf(element).filter(
    (attribute) =>
      (attribute.type?.text ?? '').startsWith('Record<') ||
      (!attribute.type && BARE_PREFIX_ATTRIBUTES.has(attribute.name))
  );
}

/**
 * The documented properties that have no attribute, so they can only be set from JavaScript.
 */
export function propertiesOf(element) {
  return (element.members ?? []).filter(
    (member) => member.kind === 'field' && isOwnApi(member) && !member.attribute
  );
}

/**
 * The documented methods of the component. The analyzer also lists lifecycle and watcher
 * methods, which have no description, and the methods of the mixins.
 */
export function methodsOf(element) {
  return (element.members ?? []).filter((member) => member.kind === 'method' && isOwnApi(member));
}

/**
 * The literal values of a union type such as `'checkbox' | 'link' | 'box'`, or null when the
 * type is not a union of string literals.
 *
 * @param {string | undefined} typeText
 */
export function literalValuesOf(typeText) {
  if (!typeText) {
    return null;
  }
  const parts = typeText.split('|').map((part) => part.trim());
  const literal = /^'([^']*)'$|^"([^"]*)"$/;
  if (parts.length < 2 || !parts.every((part) => literal.test(part))) {
    return null;
  }
  return parts.map((part) => part.slice(1, -1));
}
