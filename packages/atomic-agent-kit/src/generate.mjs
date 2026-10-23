import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {
  attributesOf,
  listElements,
  methodsOf,
  propertiesOf,
  readManifest,
  resolveType,
} from './manifest.mjs';
import {findUsageDocs} from './snippets.mjs';

const contentDir = path.resolve(import.meta.dirname, '../content');

export const skillName = 'coveo-atomic';

/**
 * Where the kit of the Atomic package at `root` is written, inside the files it publishes.
 *
 * @param {string} root
 */
export function kitDirOf(root) {
  return path.join(root, 'dist/skills', skillName);
}

/**
 * The areas of the library, keyed by their folder under `src/components`, in the order the
 * skill presents them.
 */
export const AREAS = {
  search: {title: 'Search', prefix: 'atomic-*'},
  commerce: {title: 'Commerce', prefix: 'atomic-commerce-*, atomic-product-*'},
  recommendations: {title: 'Recommendations', prefix: 'atomic-recs-*'},
  insight: {title: 'Insight panel', prefix: 'atomic-insight-*'},
  ipx: {title: 'In-product experience', prefix: 'atomic-ipx-*'},
  common: {title: 'Shared', prefix: 'atomic-*'},
};

/**
 * Reads what the generator needs from the Atomic package at `root`: the manifest, the usage
 * docs by tag, the shared notes, the hand-written content and the version.
 *
 * @param {{root: string, manifest?: object}} options A manifest to use instead of the
 * package's `custom-elements.json`
 */
export function readInputs({root, manifest = readManifest(root)}) {
  const usageDocs = new Map(
    findUsageDocs(root).map((file) => [
      path.basename(file, '.usage.mdx'),
      readFileSync(file, 'utf8'),
    ])
  );
  const notes = {
    SetRenderFunctionNote: readFileSync(
      path.join(root, 'storybook-utils/documentation/set-render-function-note.mdx'),
      'utf8'
    ),
  };
  const content = {
    skill: readFileSync(path.join(contentDir, 'SKILL.md'), 'utf8'),
    areas: Object.fromEntries(
      Object.keys(AREAS).map((area) => [
        area,
        readFileSync(path.join(contentDir, 'areas', `${area}.md`), 'utf8'),
      ])
    ),
  };
  const {version} = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  return {manifest, usageDocs, notes, content, version};
}

/**
 * Generates the skill as a map of relative file paths to Markdown.
 *
 * @param {ReturnType<typeof readInputs>} inputs
 * @returns {Map<string, string>}
 */
export function generateKit({manifest, usageDocs, notes, content, version}) {
  const elements = listElements(manifest).toSorted((a, b) => a.tagName.localeCompare(b.tagName));
  const files = new Map();

  for (const element of elements) {
    files.set(
      `references/components/${element.tagName}.md`,
      renderComponent(element, usageDocs.get(element.tagName), notes)
    );
  }
  for (const area of Object.keys(AREAS)) {
    const areaElements = elements.filter((element) => element.area === area);
    files.set(`references/${area}.md`, renderArea(area, areaElements, content.areas[area]));
  }
  files.set('SKILL.md', renderSkill(content.skill, elements, version));
  return files;
}

/**
 * Writes the generated files, replacing the previous kit.
 *
 * @param {Map<string, string>} files
 * @param {string} dir
 */
export function writeKit(files, dir) {
  rmSync(dir, {recursive: true, force: true});
  for (const [file, text] of files) {
    const target = path.join(dir, file);
    mkdirSync(path.dirname(target), {recursive: true});
    writeFileSync(target, text);
  }
}

function renderSkill(template, elements, version) {
  const rows = Object.entries(AREAS).map(([area, {title, prefix}]) => {
    const count = elements.filter((element) => element.area === area).length;
    return `| [${title}](references/${area}.md) | ${count} | \`${prefix}\` |`;
  });
  return template
    .replaceAll('{{version}}', version)
    .replaceAll('{{componentCount}}', String(elements.length))
    .replaceAll(
      '{{areas}}',
      ['| Area | Components | Tag prefix |', '| --- | --- | --- |', ...rows].join('\n')
    );
}

function renderArea(area, elements, intro) {
  const rows = elements.map(
    (element) =>
      `| [\`<${element.tagName}>\`](components/${element.tagName}.md) | ${cell(summaryOf(element))} |`
  );
  return [
    `# ${AREAS[area].title} components`,
    '',
    intro.trim(),
    '',
    '## Components',
    '',
    '| Component | What it does |',
    '| --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

function renderComponent(element, usageDoc, notes) {
  const sections = [
    `# \`<${element.tagName}>\``,
    '',
    element.description?.trim() ?? '',
    '',
    `Area: ${AREAS[element.area].title} ([index](../${element.area}.md))`,
  ];
  if (usageDoc) {
    sections.push('', '## Usage', '', convertUsageDoc(usageDoc, notes));
  }
  sections.push(
    ...renderAttributes(element),
    ...renderProperties(element),
    ...renderMethods(element),
    ...renderSlots(element),
    ...renderEvents(element),
    ...renderCssParts(element),
    ...renderCssProperties(element),
    ...renderCssStates(element)
  );
  return `${sections
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

function renderAttributes(element) {
  const attributes = attributesOf(element);
  if (attributes.length === 0) {
    return ['', '## Attributes', '', 'This component has no attributes.'];
  }
  return [
    '',
    '## Attributes',
    '',
    '| Attribute | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    ...attributes.map(
      (attribute) =>
        `| \`${attribute.name}\` | ${code(resolveType(attribute.type?.text))} | ${code(attribute.default)} | ${cell(describe(attribute))} |`
    ),
  ];
}

function renderProperties(element) {
  const properties = propertiesOf(element);
  if (properties.length === 0) {
    return [];
  }
  return [
    '',
    '## Properties set from JavaScript',
    '',
    'These have no attribute, so set them on the element from a script.',
    '',
    '| Property | Type | Description |',
    '| --- | --- | --- |',
    ...properties.map(
      (property) =>
        `| \`${property.name}\` | ${code(property.type?.text)} | ${cell(describe(property))} |`
    ),
  ];
}

function renderMethods(element) {
  const methods = methodsOf(element);
  if (methods.length === 0) {
    return [];
  }
  return [
    '',
    '## Methods',
    '',
    ...methods.map((method) => {
      const parameters = (method.parameters ?? [])
        .map(
          (parameter) =>
            `${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type?.text ?? 'unknown'}`
        )
        .join(', ');
      return `- \`${method.name}(${parameters})\`: ${inline(describe(method))}`;
    }),
  ];
}

function renderSlots(element) {
  const slots = element.slots ?? [];
  if (slots.length === 0) {
    return [];
  }
  return [
    '',
    '## Slots',
    '',
    '| Slot | Description |',
    '| --- | --- |',
    ...slots.map(
      (slot) => `| ${slot.name ? `\`${slot.name}\`` : 'default'} | ${cell(slot.description)} |`
    ),
  ];
}

function renderEvents(element) {
  const events = (element.events ?? []).filter((event) => event.name);
  if (events.length === 0) {
    return [];
  }
  return [
    '',
    '## Events',
    '',
    '| Event | Detail | Description |',
    '| --- | --- | --- |',
    ...events.map(
      (event) => `| \`${event.name}\` | ${code(event.type?.text)} | ${cell(event.description)} |`
    ),
  ];
}

function renderCssParts(element) {
  const parts = element.cssParts ?? [];
  if (parts.length === 0) {
    return [];
  }
  return [
    '',
    '## CSS parts',
    '',
    'Style them from the page with `::part()`.',
    '',
    ...parts.map((part) => `- \`${part.name}\`: ${inline(part.description)}`),
  ];
}

function renderCssProperties(element) {
  const properties = element.cssProperties ?? [];
  if (properties.length === 0) {
    return [];
  }
  return [
    '',
    '## CSS custom properties',
    '',
    ...properties.map(
      (property) =>
        `- \`${property.name}\`${property.default ? ` (default \`${property.default}\`)` : ''}: ${inline(property.description)}`
    ),
  ];
}

function renderCssStates(element) {
  const states = element.cssStates ?? [];
  if (states.length === 0) {
    return [];
  }
  return [
    '',
    '## Custom states',
    '',
    'Match them from the page with `:state()`.',
    '',
    ...states.map((state) => `- \`${state.name}\`: ${inline(state.description)}`),
  ];
}

/**
 * Turns a usage doc into plain Markdown: drops the imports, inlines the shared notes, and
 * nests the headings under the "Usage" heading of the component page, the highest one as `###`.
 */
export function convertUsageDoc(markdown, notes) {
  const text = markdown
    .replace(/^import .*\n/gm, '')
    .replace(/^<(\w+) \/>[ \t]*$/gm, (line, name) => notes[name]?.trim() ?? line);
  const levels = [...text.matchAll(/^(#{1,6}) /gm)].map((match) => match[1].length);
  const shift = levels.length ? Math.max(0, 3 - Math.min(...levels)) : 0;
  return text
    .replace(
      /^(#{1,6}) /gm,
      (heading, hashes) => `${'#'.repeat(Math.min(6, hashes.length + shift))} `
    )
    .trim();
}

function describe(member) {
  const description = member.description ?? '';
  if (!member.deprecated) {
    return description;
  }
  const reason = typeof member.deprecated === 'string' ? ` ${member.deprecated.trim()}` : '';
  return `**Deprecated**${reason ? `:${reason}` : '.'} ${description}`.trim();
}

function summaryOf(element) {
  const [firstSentence] = (element.description ?? '').split(/(?<=\.)\s/);
  return firstSentence.trim();
}

const inline = (text) => (text ?? '').replace(/\s*\n\s*/g, ' ').trim();

/**
 * A table cell: one line, pipes escaped, and code blocks turned into inline code.
 */
const cell = (text) =>
  inline(
    (text ?? '').replace(/```\w*\n([\s\S]*?)```/g, (block, snippet) => `\`${snippet.trim()}\``)
  ).replaceAll('|', '\\|');

const code = (text) =>
  text === undefined || text === '' ? '' : `\`${String(text).replaceAll('|', '\\|')}\``;
