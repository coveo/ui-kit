import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {lineOf, parseHtml, walk} from './html.mjs';
import {
  attributesOf,
  indexByTag,
  isPrefixAttribute,
  listElements,
  literalValuesOf,
  resolveType,
} from './manifest.mjs';

/**
 * The item templates: the lists that may contain each one and whether an empty `<template>`
 * is accepted, as `BaseTemplateController` checks them at run time (`validParents` and
 * `allowEmpty` in each template component).
 */
export const ITEM_TEMPLATES = {
  'atomic-result-template': {
    hosts: ['atomic-result-list', 'atomic-folded-result-list', 'atomic-search-box-instant-results'],
    allowEmpty: true,
  },
  'atomic-result-children-template': {hosts: ['atomic-result-children'], allowEmpty: false},
  'atomic-product-template': {
    hosts: [
      'atomic-commerce-product-list',
      'atomic-commerce-recommendation-list',
      'atomic-commerce-search-box-instant-products',
    ],
    allowEmpty: true,
  },
  'atomic-recs-result-template': {
    hosts: ['atomic-recs-list', 'atomic-ipx-recs-list'],
    allowEmpty: true,
  },
  'atomic-insight-result-template': {
    hosts: ['atomic-insight-result-list', 'atomic-insight-folded-result-list'],
    allowEmpty: true,
  },
  'atomic-insight-result-children-template': {
    hosts: ['atomic-insight-result-children'],
    allowEmpty: false,
  },
};

const GLOBAL_ATTRIBUTES = new Set([
  'accesskey',
  'autofocus',
  'class',
  'contenteditable',
  'dir',
  'draggable',
  'exportparts',
  'hidden',
  'id',
  'inert',
  'is',
  'lang',
  'nonce',
  'part',
  'popover',
  'role',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
]);

const isGlobalAttribute = (name) =>
  GLOBAL_ATTRIBUTES.has(name) || name.startsWith('aria-') || name.startsWith('data-');

const isPlaceholder = (value) =>
  value === null || /\.\.\.|[{}$<>]/.test(value) || value.trim() === '';

const listFiles = (dir, matches) =>
  readdirSync(dir, {withFileTypes: true, recursive: true})
    .filter((entry) => entry.isFile() && matches(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

/**
 * Every `*.usage.mdx` under `src/components` of the Atomic package at `root`, sorted.
 *
 * @param {string} root
 */
export function findUsageDocs(root) {
  return listFiles(path.join(root, 'src/components'), (name) => name.endsWith('.usage.mdx'));
}

/**
 * The tags the sources of the Atomic package at `root` define with `@customElement`,
 * including those of the `@internal` components that the manifest leaves out.
 *
 * @param {string} root
 */
export function findSourceTags(root) {
  const tags = new Set();
  const sources = listFiles(
    path.join(root, 'src/components'),
    (name) => name.endsWith('.ts') && !/\.(spec|stories)\.|\.d\.ts$/.test(name)
  );
  for (const file of sources) {
    for (const match of readFileSync(file, 'utf8').matchAll(
      /^@customElement\('([a-z0-9-]+)'\)/gm
    )) {
      tags.add(match[1]);
    }
  }
  return tags;
}

/**
 * What snippets are checked against: the public elements of the manifest by tag, and the tags
 * of the internal components, which are accepted but not checked.
 *
 * @param {object} manifest
 * @param {Set<string>} sourceTags The tags defined in the sources, see `findSourceTags`
 */
export function createCatalog(manifest, sourceTags) {
  const byTag = indexByTag(listElements(manifest));
  const internalTags = new Set([...sourceTags].filter((tag) => !byTag.has(tag)));
  return {byTag, internalTags};
}

/**
 * Checks an HTML snippet against the manifest: every `atomic-*` element and attribute must
 * exist, attribute values must be allowed, named slots must exist on the parent, and item
 * templates must be built the way `BaseTemplateController` requires.
 *
 * @param {string} code
 * @param {{byTag: Map<string, object>, internalTags: Set<string>}} catalog See `createCatalog`
 * @returns {{line: number, message: string}[]}
 */
export function validateHtml(code, {byTag, internalTags}) {
  const problems = [];
  const report = (node, message) => problems.push({line: node.line, message});

  for (const node of walk(parseHtml(code))) {
    if (!node.tag.startsWith('atomic-')) {
      continue;
    }
    if (node.selfClosing) {
      report(node, `<${node.tag} /> does not close the element: write <${node.tag}></${node.tag}>`);
    }
    if (internalTags.has(node.tag)) {
      continue;
    }
    const element = byTag.get(node.tag);
    if (!element) {
      report(node, `<${node.tag}> is not an Atomic component`);
      continue;
    }
    checkAttributes(node, element, report);
    checkSlots(node, element, report);
    checkTemplate(node, report);
  }
  return problems;
}

function checkAttributes(node, element, report) {
  const attributes = attributesOf(element);
  const byName = new Map(attributes.map((attribute) => [attribute.name.toLowerCase(), attribute]));
  const prefixes = attributes.filter(isPrefixAttribute).map((attribute) => `${attribute.name}-`);

  for (const {name, value} of node.attributes) {
    if (isGlobalAttribute(name) || prefixes.some((prefix) => name.startsWith(prefix))) {
      continue;
    }
    const attribute = byName.get(name);
    if (!attribute) {
      report(node, `<${node.tag}> has no "${name}" attribute`);
      continue;
    }
    if (isPrefixAttribute(attribute)) {
      report(node, `"${name}" takes a field in its name: ${name}-<field>="…"`);
      continue;
    }
    if (attribute.deprecated) {
      report(node, `the "${name}" attribute of <${node.tag}> is deprecated`);
    }
    if (isPlaceholder(value)) {
      continue;
    }
    const typeText = resolveType(attribute.type?.text);
    const literals = literalValuesOf(typeText);
    if (literals && !literals.includes(value)) {
      report(
        node,
        `"${value}" is not a value of the "${name}" attribute of <${node.tag}> (${typeText})`
      );
    }
    if (typeText === 'boolean' && !['true', 'false'].includes(value)) {
      report(node, `the "${name}" attribute of <${node.tag}> is a boolean, not "${value}"`);
    }
  }
}

function checkSlots(node, element, report) {
  const slots = (element.slots ?? []).map((slot) => slot.name);
  for (const child of node.children) {
    const slot = child.attributes.find((attribute) => attribute.name === 'slot');
    if (slot && !slots.includes(slot.value ?? '')) {
      report(child, `<${node.tag}> has no "${slot.value}" slot`);
    }
  }
}

function checkTemplate(node, report) {
  const rule = ITEM_TEMPLATES[node.tag];
  if (!rule) {
    return;
  }
  if (node.parent && !rule.hosts.includes(node.parent.tag)) {
    report(
      node,
      `<${node.tag}> must be a direct child of ${rule.hosts.map((host) => `<${host}>`).join(', ')}`
    );
  }
  const template = node.children.find(
    (child) => child.tag === 'template' && !child.attributes.some((a) => a.name === 'slot')
  );
  if (!template) {
    report(node, `<${node.tag}> must contain a <template> element`);
    return;
  }
  if (!rule.allowEmpty && template.empty) {
    report(template, `the <template> of <${node.tag}> must not be empty`);
  }
  if (walk(template.children).some((child) => child.tag === 'script')) {
    report(
      template,
      `the <template> of <${node.tag}> must not contain a <script>: Atomic ignores it`
    );
  }
}

/**
 * The fenced code blocks of a Markdown document, with the line of each fence.
 *
 * @param {string} markdown
 * @returns {{lang: string, code: string, line: number}[]}
 */
export function extractSnippets(markdown) {
  const snippets = [];
  for (const match of markdown.matchAll(/^```(\w*)[^\n]*\n([\s\S]*?)^```/gm)) {
    snippets.push({
      lang: match[1].toLowerCase(),
      code: match[2],
      line: lineOf(markdown, match.index),
    });
  }
  return snippets;
}

/**
 * Checks every HTML snippet of a Markdown document, reporting lines of the document.
 *
 * @param {string} markdown
 * @param {{byTag: Map<string, object>, internalTags: Set<string>}} catalog
 * @returns {{line: number, message: string}[]}
 */
export function validateMarkdown(markdown, catalog) {
  return extractSnippets(markdown)
    .filter((snippet) => snippet.lang === 'html')
    .flatMap((snippet) =>
      validateHtml(snippet.code, catalog).map(({line, message}) => ({
        line: snippet.line + line,
        message,
      }))
    );
}

/**
 * Checks every HTML snippet of a usage doc.
 *
 * @param {string} file Absolute path of the `*.usage.mdx`
 * @param {{byTag: Map<string, object>, internalTags: Set<string>}} catalog
 * @param {string} root The Atomic package, so that problems name the file relative to it
 * @returns {string[]} One `file:line message` per problem
 */
export function validateUsageDoc(file, catalog, root) {
  const relativePath = path.relative(root, file);
  return validateMarkdown(readFileSync(file, 'utf8'), catalog).map(
    ({line, message}) => `${relativePath}:${line} ${message}`
  );
}
