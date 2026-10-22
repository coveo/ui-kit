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
 * @typedef {{tag: string, attributes: {name: string, value: string | null}[], children: Node[], parent: Node | null, line: number}} Node
 */

/**
 * Parses snippet HTML into a tree. Text and comments are dropped. Unclosed tags are tolerated,
 * since docs often show fragments, and a stray closing tag closes the nearest open tag of its name.
 *
 * @param {string} source
 * @returns {Node} A root node whose children are the top-level elements.
 */
export function parseHtml(source) {
  const root = {tag: '#root', attributes: [], children: [], parent: null, line: 1};
  let current = root;
  let position = 0;
  const lineAt = (index) => source.slice(0, index).split('\n').length;

  while (position < source.length) {
    const open = source.indexOf('<', position);
    if (open === -1) {
      break;
    }
    if (source.startsWith('<!--', open)) {
      const end = source.indexOf('-->', open + 4);
      position = end === -1 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('</', open)) {
      const end = source.indexOf('>', open);
      const tag = source
        .slice(open + 2, end === -1 ? source.length : end)
        .trim()
        .toLowerCase();
      let node = current;
      while (node !== root && node.tag !== tag) {
        node = node.parent;
      }
      if (node !== root) {
        current = node.parent;
      }
      position = end === -1 ? source.length : end + 1;
      continue;
    }
    const tagMatch = /^<([a-zA-Z][^\s/>]*)/.exec(source.slice(open));
    if (!tagMatch) {
      position = open + 1;
      continue;
    }
    const tag = tagMatch[1].toLowerCase();
    const end = findTagEnd(source, open + tagMatch[0].length);
    const inside = source.slice(open + tagMatch[0].length, end);
    const selfClosing = inside.trimEnd().endsWith('/');
    const node = {
      tag,
      attributes: parseAttributes(selfClosing ? inside.trimEnd().slice(0, -1) : inside),
      children: [],
      parent: current,
      line: lineAt(open),
    };
    current.children.push(node);
    position = end + 1;

    if (RAW_TEXT_ELEMENTS.has(tag)) {
      const close = source.toLowerCase().indexOf(`</${tag}`, position);
      const closeEnd = close === -1 ? -1 : source.indexOf('>', close);
      position = closeEnd === -1 ? source.length : closeEnd + 1;
      continue;
    }
    if (!selfClosing && !VOID_ELEMENTS.has(tag)) {
      current = node;
    }
  }
  return root;
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
 * Every element of a tree, depth first.
 *
 * @param {Node} root
 * @returns {Node[]}
 */
export function walk(root) {
  return root.children.flatMap((child) => [child, ...walk(child)]);
}
