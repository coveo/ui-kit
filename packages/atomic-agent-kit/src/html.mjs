const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+)))?/g;

/**
 * @typedef {object} Node
 * @property {string} tag Lowercase tag name
 * @property {{name: string, value: string | null}[]} attributes Names lowercased
 * @property {Node[]} children
 * @property {Node | null} parent Null for a top-level element
 * @property {number} line 1-based line of the start tag
 * @property {boolean} selfClosing Written as `<tag />`, which HTML ignores on a non-void element
 * @property {boolean} empty No element, text or comment inside, like `innerHTML.trim() === ''`
 */

/**
 * The 1-based line of an index in a text.
 */
export function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * Parses snippet HTML into a tree of elements. Text and comments are dropped. Unclosed tags are
 * tolerated, since docs often show fragments, and a stray closing tag closes the nearest open
 * element of its name. As in HTML, `/>` does not close a non-void element.
 *
 * @param {string} source
 * @returns {Node[]} The top-level elements
 */
export function parseHtml(source) {
  const topLevel = [];
  const open = [];
  let position = 0;
  const fill = () => {
    const parent = open.at(-1);
    if (parent) {
      parent.empty = false;
    }
  };

  while (position < source.length) {
    const start = source.indexOf('<', position);
    if (start === -1) {
      break;
    }
    if (source.slice(position, start).trim()) {
      fill();
    }
    if (source.startsWith('<!--', start)) {
      fill();
      const end = source.indexOf('-->', start + 4);
      position = end === -1 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('</', start)) {
      const end = source.indexOf('>', start);
      const tag = source
        .slice(start + 2, end === -1 ? source.length : end)
        .trim()
        .toLowerCase();
      const index = open.findLastIndex((node) => node.tag === tag);
      if (index !== -1) {
        open.length = index;
      }
      position = end === -1 ? source.length : end + 1;
      continue;
    }
    const tagMatch = /^<([a-zA-Z][^\s/>]*)/.exec(source.slice(start));
    if (!tagMatch) {
      position = start + 1;
      continue;
    }
    const tag = tagMatch[1].toLowerCase();
    const end = findTagEnd(source, start + tagMatch[0].length);
    const inside = source.slice(start + tagMatch[0].length, end);
    const selfClosing = inside.trimEnd().endsWith('/');
    const parent = open.at(-1) ?? null;
    const node = {
      tag,
      attributes: parseAttributes(selfClosing ? inside.trimEnd().slice(0, -1) : inside),
      children: [],
      parent,
      line: lineOf(source, start),
      selfClosing,
      empty: true,
    };
    fill();
    (parent?.children ?? topLevel).push(node);
    position = end + 1;

    if (RAW_TEXT_ELEMENTS.has(tag)) {
      const close = source.toLowerCase().indexOf(`</${tag}`, position);
      const closeEnd = close === -1 ? -1 : source.indexOf('>', close);
      node.empty = !source.slice(position, close === -1 ? source.length : close).trim();
      position = closeEnd === -1 ? source.length : closeEnd + 1;
    } else if (!VOID_ELEMENTS.has(tag)) {
      open.push(node);
    }
  }
  return topLevel;
}

function findTagEnd(source, from) {
  let quote = null;
  for (let index = from; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote) {
        quote = null;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return index;
    }
  }
  return source.length;
}

function parseAttributes(inside) {
  const attributes = [];
  for (const match of inside.matchAll(ATTRIBUTE)) {
    const [, name, doubleQuoted, singleQuoted, bare] = match;
    attributes.push({
      name: name.toLowerCase(),
      value: doubleQuoted ?? singleQuoted ?? bare ?? null,
    });
  }
  return attributes;
}

/**
 * The elements of a tree, depth first.
 *
 * @param {Node[]} nodes
 * @returns {Node[]}
 */
export function walk(nodes) {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}
