import type {PhrasesToHighlight, TermsToHighlight} from '@coveo/headless';
import {QuickviewWordHighlight} from './quickview-word-highlight';

/**
 * A keyword to find in the quickview document: a sequence of words, each
 * accepting any of its spellings (the term and its stemming expansions).
 *
 * @internal
 */
export interface QuickviewKeyword {
  text: string;
  words: string[][];
}

// Same palette, in the same order, as the one the Search API uses for its
// highlight tags, so keywords keep the colors users are used to.
const KEYWORD_COLORS = [
  'rgb(176, 255, 255)',
  'rgb(191, 191, 255)',
  'rgb(255, 230, 184)',
  'rgb(233, 189, 255)',
  'rgb(232, 255, 183)',
  'rgb(180, 231, 255)',
  'rgb(255, 187, 233)',
  'rgb(156, 255, 156)',
  'rgb(255, 185, 186)',
  'rgb(181, 255, 229)',
  'rgb(201, 211, 212)',
];

const IGNORED_ELEMENTS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TEXTAREA', 'SELECT']);
const IGNORED_IDS = new Set(['CoveoPreviewBar', 'CoveoDocIdentifier']);
const INLINE_ELEMENTS = new Set([
  'A',
  'ABBR',
  'B',
  'BDI',
  'BDO',
  'BIG',
  'CITE',
  'CODE',
  'COVEOTAGGEDWORD',
  'DATA',
  'DEL',
  'DFN',
  'EM',
  'FONT',
  'I',
  'INS',
  'KBD',
  'LABEL',
  'MARK',
  'Q',
  'S',
  'SAMP',
  'SMALL',
  'SPAN',
  'STRIKE',
  'STRONG',
  'SUB',
  'SUP',
  'TIME',
  'TT',
  'U',
  'VAR',
]);

// Never part of a match, so a phrase cannot span two blocks.
const BLOCK_SEPARATOR = '\u0000';
const WORD_SEPARATOR = '[\\s\\p{P}]+';

interface TextIndex {
  text: string;
  nodes: Text[];
  starts: number[];
}

function closestBlock(node: Node) {
  let element = node.parentElement;
  while (element && INLINE_ELEMENTS.has(element.tagName.toUpperCase())) {
    element = element.parentElement;
  }
  return element;
}

function indexText(root: HTMLElement): TextIndex {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return NodeFilter.FILTER_ACCEPT;
        }
        const element = node as Element;
        return IGNORED_ELEMENTS.has(element.tagName.toUpperCase()) || IGNORED_IDS.has(element.id)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

  const index: TextIndex = {text: '', nodes: [], starts: []};
  let previousBlock: Element | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const textNode = node as Text;
    const block = closestBlock(textNode);
    if (index.nodes.length && block !== previousBlock) {
      index.text += BLOCK_SEPARATOR;
    }
    previousBlock = block;
    index.nodes.push(textNode);
    index.starts.push(index.text.length);
    index.text += textNode.data;
  }
  return index;
}

function nodeAt(index: TextIndex, offset: number, isEnd: boolean) {
  let low = 0;
  let high = index.nodes.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const start = index.starts[middle];
    if (start < offset || (!isEnd && start === offset)) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low;
}

function createRange(index: TextIndex, start: number, end: number) {
  const startNode = nodeAt(index, start, false);
  const endNode = nodeAt(index, end, true);
  const range = index.nodes[startNode].ownerDocument.createRange();
  range.setStart(index.nodes[startNode], start - index.starts[startNode]);
  range.setEnd(index.nodes[endNode], end - index.starts[endNode]);
  return range;
}

function escapeSpelling(spelling: string) {
  return spelling
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, WORD_SEPARATOR);
}

function buildPattern(keyword: QuickviewKeyword) {
  const words = keyword.words.map((spellings) => {
    const alternatives = [...new Set(spellings.map(escapeSpelling).filter(Boolean))].sort(
      (a, b) => b.length - a.length
    );
    return `(?:${alternatives.join('|')})`;
  });
  return new RegExp(`(?<![\\p{L}\\p{N}_])${words.join(WORD_SEPARATOR)}(?![\\p{L}\\p{N}_])`, 'giu');
}

function findRanges(index: TextIndex, keyword: QuickviewKeyword) {
  if (!keyword.words.length) {
    return [];
  }
  return Array.from(index.text.matchAll(buildPattern(keyword)), (match) =>
    createRange(index, match.index, match.index + match[0].length)
  );
}

/**
 * Lists the keywords to highlight from the terms and phrases the Search API
 * returned with the query response.
 *
 * @internal
 */
export function getQuickviewKeywords(
  termsToHighlight: TermsToHighlight,
  phrasesToHighlight: PhrasesToHighlight
): QuickviewKeyword[] {
  return [
    ...Object.entries(termsToHighlight).map(([term, expansions]) => ({
      text: term,
      words: [[term, ...expansions]],
    })),
    ...Object.entries(phrasesToHighlight).map(([phrase, words]) => ({
      text: phrase,
      words: Object.entries(words).map(([word, expansions]) => [word, ...expansions]),
    })),
  ];
}

/**
 * Finds every occurrence of the keywords in the text of the quickview
 * document, without modifying it.
 *
 * @internal
 */
export function getWordsHighlights(
  keywords: QuickviewKeyword[],
  iframe?: HTMLIFrameElement
): Record<string, QuickviewWordHighlight> {
  const root = iframe?.contentDocument?.body;
  if (!root) {
    return {};
  }

  const index = indexText(root);
  const words: Record<string, QuickviewWordHighlight> = {};
  keywords.forEach((keyword, position) => {
    const ranges = findRanges(index, keyword);
    if (!ranges.length) {
      return;
    }
    const identifier = `${position + 1}`;
    const color = KEYWORD_COLORS[position % KEYWORD_COLORS.length];
    words[identifier] = new QuickviewWordHighlight(identifier, keyword.text, color, ranges);
  });
  return words;
}
