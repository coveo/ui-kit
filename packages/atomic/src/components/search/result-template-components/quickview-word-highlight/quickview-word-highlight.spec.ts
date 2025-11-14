import type {TermsToHighlight} from '@coveo/headless';
import {afterEach, describe, expect, it} from 'vitest';
import {
  getWordsHighlights,
  HIGHLIGHT_PREFIX,
  QuickviewWordHighlight,
} from './quickview-word-highlight';

// Shared helper & constants for tagged word creation (supports iframe documents)
const baseColor = 'rgb(10, 20, 30)';
function createTaggedWordElement(
  id: string,
  text: string,
  color = baseColor,
  ownerDoc: Document = document
) {
  const el = ownerDoc.createElement('coveotaggedword');
  el.id = `${HIGHLIGHT_PREFIX}.${id}.0.1`;
  el.style.backgroundColor = color;
  const child = ownerDoc.createElement('span');
  child.innerText = text;
  el.appendChild(child);
  return el;
}

describe('QuickviewWordHighlight', () => {
  const stemmingInfo: TermsToHighlight = {
    keyword: ['keyword', 'keywords'],
    test: ['test', 'tests'],
  };

  it('initializes with correct properties', () => {
    const el = createTaggedWordElement('1', 'keyword');
    const highlight = new QuickviewWordHighlight(stemmingInfo, el);
    expect(highlight.text).toBe('keyword');
    expect(highlight.indexIdentifier).toBe('1');
    expect(highlight.color).toBe(baseColor);
    expect(highlight.occurrences).toBe(1);
    expect(highlight.elements).toContain(el);
  });

  it('adds elements and tracks occurrences', () => {
    const el1 = createTaggedWordElement('2', 'test');
    const el2 = createTaggedWordElement('2', 'test');
    const highlight = new QuickviewWordHighlight(stemmingInfo, el1);
    highlight.addElement(el2);
    expect(highlight.occurrences).toBe(2);
    expect(highlight.elements).toEqual([el1, el2]);
  });

  it('navigates forward and applies highlighting styles', () => {
    const el1 = createTaggedWordElement('3', 'keyword');
    const el2 = createTaggedWordElement('3', 'keyword');
    const highlight = new QuickviewWordHighlight(stemmingInfo, el1);
    highlight.addElement(el2);

    // First forward navigation -> el1 focused
    highlight.navigateForward();
    expect(el1.style.color).toBe(baseColor);
    expect(el1.style.backgroundColor).toBe('rgb(245, 235, 225)');
    expect(el2.style.color).toBe('');
    expect(el2.style.backgroundColor).toBe(baseColor);

    // Second forward navigation -> el2 focused
    highlight.navigateForward();
    expect(el2.style.color).toBe(baseColor);
    expect(el2.style.backgroundColor).toBe('rgb(245, 235, 225)');
    expect(el1.style.color).toBe('');
    expect(el1.style.backgroundColor).toBe(baseColor);
  });

  it('navigates backward and reapplies highlighting styles', () => {
    // Use valid numeric id so parseKeywordIdentifier succeeds
    const el1 = createTaggedWordElement('5', 'keyword');
    const el2 = createTaggedWordElement('5', 'keyword');
    const highlight = new QuickviewWordHighlight(stemmingInfo, el1);
    highlight.addElement(el2);

    // Move forward twice so el2 is focused
    highlight.navigateForward();
    highlight.navigateForward();
    expect(el2.style.backgroundColor).toBe('rgb(245, 235, 225)');

    // Navigate backward -> el1 should be focused again
    highlight.navigateBackward();
    expect(el1.style.color).toBe(baseColor);
    expect(el1.style.backgroundColor).toBe('rgb(245, 235, 225)');
    expect(el2.style.color).toBe('');
    expect(el2.style.backgroundColor).toBe(baseColor);
  });

  it('computes inverted and saturated colors', () => {
    const el = createTaggedWordElement('4', 'keyword');
    const highlight = new QuickviewWordHighlight(stemmingInfo, el);
    expect(highlight.focusedColor).toBe('rgb(245, 235, 225)');
    expect(highlight.previewBorderColor).toBe('rgb(0, 15, 30)');
  });

  it('throws on invalid keyword identifier', () => {
    const el = document.createElement('coveotaggedword');
    el.id = 'invalid';
    el.innerText = 'keyword';
    el.style.backgroundColor = baseColor;
    expect(() => new QuickviewWordHighlight(stemmingInfo, el)).toThrow();
  });
});

describe('getWordsHighlights', () => {
  const stemmingInfo: TermsToHighlight = {
    keyword: ['keyword', 'keywords'],
    test: ['test', 'tests'],
  };

  let iframe: HTMLIFrameElement | undefined;

  function createIframeWithTaggedWords(ids: string[], texts: string[]) {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error('No iframe document');
    const body = doc.body;
    ids.forEach((id, i) => {
      const el = createTaggedWordElement(id, texts[i], 'rgb(10, 20, 30)', doc);
      body.appendChild(el);
    });
  }

  afterEach(() => {
    if (iframe && document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    iframe = undefined;
  });

  it('returns empty object if no iframe', () => {
    expect(getWordsHighlights(stemmingInfo)).toEqual({});
  });

  it('finds and groups highlights in iframe', () => {
    createIframeWithTaggedWords(
      ['1', '1', '2'],
      ['keyword', 'keyword', 'test']
    );
    const highlights = getWordsHighlights(stemmingInfo, iframe);
    expect(Object.keys(highlights)).toContain('1');
    expect(Object.keys(highlights)).toContain('2');
    expect(highlights['1'].occurrences).toBe(2);
    expect(highlights['2'].occurrences).toBe(1);
  });
});
