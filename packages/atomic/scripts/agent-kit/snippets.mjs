import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {parseHtml, walk} from './html.mjs';
import {
  attributesOf,
  indexByTag,
  listElements,
  literalValuesOf,
  packageRoot,
  prefixAttributesOf,
} from './manifest.mjs';

/**
 * The item templates and the lists that may contain them, as `BaseTemplateController` checks
 * them at run time (`validParents` in each template component).
 */
export const TEMPLATE_HOSTS = {
  'atomic-result-template': [
    'atomic-result-list',
    'atomic-folded-result-list',
    'atomic-search-box-instant-results',
  ],
  'atomic-result-children-template': ['atomic-result-children'],
  'atomic-product-template': [
    'atomic-commerce-product-list',
    'atomic-commerce-recommendation-list',
    'atomic-commerce-search-box-instant-products',
  ],
  'atomic-recs-result-template': ['atomic-recs-list', 'atomic-ipx-recs-list'],
  'atomic-insight-result-template': [
    'atomic-insight-result-list',
    'atomic-insight-folded-result-list',
  ],
  'atomic-insight-result-children-template': ['atomic-insight-result-children'],
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
  GLOBAL_ATTRIBUTES.has(name) ||
  name.startsWith('aria-') ||
  name.startsWith('data-') ||
  name.startsWith('on');

const isPlaceholder = (value) =>
  value === null || /\.\.\.|[{}$<>]/.test(value) || value.trim() === '';

const componentsDir = path.join(packageRoot, 'src/components');

const listFiles = (dir, matches) =>
  readdirSync(dir, {withFileTypes: true, recursive: true})
    .filter((entry) => entry.isFile() && matches(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

/**
 * Every `*.usage.mdx` under `src/components`, sorted.
 */
export function findUsageDocs(dir = componentsDir) {
  return listFiles(dir, (name) => name.endsWith('.usage.mdx'));
}

/**
 * The tags the sources define with `@customElement`, including those of the `@internal`
 * components that the manifest leaves out.
 */
export function findSourceTags(dir = componentsDir) {
  const tags = new Set();
  const sources = listFiles(
    dir,
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
 * @param {Set<string>} [sourceTags]
 */
export function createCatalog(manifest, sourceTags = findSourceTags()) {
  const byTag = indexByTag(listElements(manifest));
  const hiddenTags = new Set([...sourceTags].filter((tag) => !byTag.has(tag)));
  return {byTag, hiddenTags};
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
      line: markdown.slice(0, match.index).split('\n').length,
    });
  }
  return snippets;
}

/**
 * Checks an HTML snippet against the manifest: every `atomic-*` element and attribute must
 * exist, attribute values must be allowed, named slots must exist on the parent, and item
 * templates must be built the way `BaseTemplateController` requires.
 *
 * @param {string} code
 * @param {{byTag: Map<string, object>, hiddenTags: Set<string>}} catalog See `createCatalog`
 * @returns {{line: number, message: string}[]}
 */
export function validateHtml(code, {byTag, hiddenTags}) {
  const problems = [];
  const report = (node, message) => problems.push({line: node.line, message});
  const root = parseHtml(code);

  for (const node of walk(root)) {
    if (!node.tag.startsWith('atomic-') || hiddenTags.has(node.tag)) {
      continue;
    }
    const element = byTag.get(node.tag);
    if (!element) {
      report(node, `<${node.tag}> is not an Atomic component`);
      continue;
    }
    checkAttributes(node, element, report);
    checkSlots(node, byTag, report);
    checkTemplate(node, report);
  }
  return problems;
}

function checkAttributes(node, element, report) {
  const attributes = attributesOf(element);
  const prefixes = prefixAttributesOf(element).map((attribute) => `${attribute.name}-`);

  for (const {name, value} of node.attributes) {
    if (isGlobalAttribute(name)) {
      continue;
    }
    const attribute = attributes.find((candidate) => candidate.name === name);
    if (!attribute) {
      if (!prefixes.some((prefix) => name.startsWith(prefix))) {
        report(node, `<${node.tag}> has no "${name}" attribute`);
      }
      continue;
    }
    if (attribute.deprecated) {
      report(node, `the "${name}" attribute of <${node.tag}> is deprecated`);
    }
    if (isPlaceholder(value)) {
      continue;
    }
    const typeText = attribute.type?.text;
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

function checkSlots(node, byTag, report) {
  const parent = node.parent;
  const slot = node.attributes.find((attribute) => attribute.name === 'slot');
  if (!slot || !parent || !byTag.has(parent.tag)) {
    return;
  }
  const slots = (byTag.get(parent.tag).slots ?? []).map((candidate) => candidate.name);
  if (!slots.includes(slot.value ?? '')) {
    report(node, `<${parent.tag}> has no "${slot.value}" slot`);
  }
}

function checkTemplate(node, report) {
  const hosts = TEMPLATE_HOSTS[node.tag];
  if (!hosts) {
    return;
  }
  if (node.parent?.tag !== '#root' && !hosts.includes(node.parent?.tag)) {
    report(
      node,
      `<${node.tag}> must be a direct child of ${hosts.map((h) => `<${h}>`).join(', ')}`
    );
  }
  const template = node.children.find(
    (child) => child.tag === 'template' && !child.attributes.some((a) => a.name === 'slot')
  );
  if (!template) {
    report(node, `<${node.tag}> must contain a <template> element`);
    return;
  }
  if (walk(template).some((child) => child.tag === 'script')) {
    report(template, `the <template> of <${node.tag}> must not contain a <script>`);
  }
}

/**
 * Checks every HTML snippet of a usage doc.
 *
 * @param {string} file Absolute path of the `*.usage.mdx`
 * @param {{byTag: Map<string, object>, hiddenTags: Set<string>}} catalog
 * @returns {string[]} One `file:line message` per problem
 */
export function validateUsageDoc(file, catalog) {
  const relativePath = path.relative(packageRoot, file);
  return extractSnippets(readFileSync(file, 'utf8'))
    .filter((snippet) => snippet.lang === 'html')
    .flatMap((snippet) =>
      validateHtml(snippet.code, catalog).map(
        ({line, message}) => `${relativePath}:${snippet.line + line} ${message}`
      )
    );
}
