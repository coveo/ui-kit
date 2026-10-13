import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {create, ts} from '@custom-elements-manifest/analyzer';
import {litPlugin} from '@custom-elements-manifest/analyzer/src/features/framework-plugins/lit/lit.js';
import config from '../../../custom-elements-manifest.config.mjs';

const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));

/**
 * Runs the analyzer over in-memory sources, with the same Lit support the CLI adds for `litelement: true`.
 * Modules are analyzed in insertion order.
 *
 * @param {Record<string, string>} sources Module path to TypeScript source
 * @param {object[]} plugins Plugins to run after the built-in ones
 */
export function analyze(sources, plugins) {
  const modules = Object.entries(sources).map(([path, source]) =>
    ts.createSourceFile(path, source, ts.ScriptTarget.ES2015, true)
  );
  return create({modules, plugins: [...litPlugin(), ...plugins]});
}

/**
 * Runs the analyzer over the real Atomic sources, with the globs and plugins from
 * `custom-elements-manifest.config.mjs`.
 */
export function analyzeAtomic() {
  const files = ts.sys
    .readDirectory(packageRoot, ['.ts'], config.exclude, config.globs)
    .map((file) => file.slice(packageRoot.length))
    .sort();
  const sources = Object.fromEntries(
    files.map((file) => [file, readFileSync(`${packageRoot}${file}`, 'utf8')])
  );
  return analyze(sources, config.plugins);
}

export function findElement(manifest, tagName) {
  return manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .find((declaration) => declaration.tagName === tagName);
}

export function findModule(manifest, path) {
  return manifest.modules.find((module) => module.path === path);
}

export function findMember(declaration, name) {
  return declaration.members?.find((member) => member.name === name);
}

export function findAttribute(declaration, name) {
  return declaration.attributes?.find((attribute) => attribute.name === name);
}

/**
 * Source of a module declaring one Lit custom element.
 *
 * @param {string} tagName
 * @param {string} className
 * @param {string} body Class body, e.g. decorated fields
 */
export function litElement(tagName, className, body) {
  return `
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('${tagName}')
export class ${className} extends LitElement {
${body}
}
`;
}
