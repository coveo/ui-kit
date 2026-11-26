import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {getQuickviewKeywords, getWordsHighlights, type QuickviewKeyword} from './term-matcher';

describe('term-matcher', () => {
  describe('#getQuickviewKeywords', () => {
    it('should list the terms, then the phrases, with their expansions', () => {
      expect(
        getQuickviewKeywords(
          {community: ['communities'], metrics: []},
          {'admin metrics': {admin: [], metrics: ['metric']}}
        )
      ).toEqual([
        {text: 'community', words: [['community', 'communities']]},
        {text: 'metrics', words: [['metrics']]},
        {text: 'admin metrics', words: [['admin'], ['metrics', 'metric']]},
      ]);
    });
  });

  describe('#getWordsHighlights', () => {
    let iframe: HTMLIFrameElement;

    const term = (text: string, ...expansions: string[]): QuickviewKeyword => ({
      text,
      words: [[text, ...expansions]],
    });

    const phrase = (text: string): QuickviewKeyword => ({
      text,
      words: text.split(' ').map((word) => [word]),
    });

    const render = (html: string) => {
      iframe.contentDocument!.body.innerHTML = html;
    };

    const matchedTexts = (keywords: QuickviewKeyword[]) =>
      Object.values(getWordsHighlights(keywords, iframe)).map((word) =>
        word.ranges.map((range) => range.toString())
      );

    beforeEach(() => {
      iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
    });

    afterEach(() => {
      iframe.remove();
    });

    it('should return no words when the iframe document is not accessible', () => {
      expect(getWordsHighlights([term('alpha')], undefined)).toEqual({});
    });

    it('should find a term and its expansions regardless of case', () => {
      render('<p>Community and communities, COMMUNITY.</p>');
      expect(matchedTexts([term('community', 'communities')])).toEqual([
        ['Community', 'communities', 'COMMUNITY'],
      ]);
    });

    it('should only match whole words', () => {
      render('<p>prefix pre-release pre</p>');
      expect(matchedTexts([term('pre')])).toEqual([['pre', 'pre']]);
    });

    it('should match a term split across inline elements', () => {
      render('<p>Com<b>mun</b><i>ity</i> page</p>');
      const [word] = Object.values(getWordsHighlights([term('community')], iframe));
      const [range] = word.ranges;
      expect(range.toString()).toBe('Community');
      expect(range.startContainer).not.toBe(range.endContainer);
    });

    it('should match a phrase across whitespace and punctuation', () => {
      render('<p>admin metrics, admin\n  metrics and admin: metrics</p>');
      expect(matchedTexts([phrase('admin metrics')])).toEqual([
        ['admin metrics', 'admin\n  metrics', 'admin: metrics'],
      ]);
    });

    it('should not match a phrase across two blocks', () => {
      render('<p>admin</p><p>metrics</p>');
      expect(matchedTexts([phrase('admin metrics')])).toEqual([]);
    });

    it('should not join words of two blocks into one', () => {
      render('<p>foo</p><p>bar</p>');
      expect(matchedTexts([term('foobar')])).toEqual([]);
    });

    it('should escape regular expression characters in terms', () => {
      render('<p>c++ and cpp</p>');
      expect(matchedTexts([term('c++')])).toEqual([['c++']]);
    });

    it('should ignore scripts, styles and the quickview elements', () => {
      render(`
        <script>var alpha;</script>
        <style>.alpha {}</style>
        <div id="CoveoPreviewBar">alpha</div>
        <div id="CoveoDocIdentifier">alpha</div>
        <p>alpha</p>`);
      expect(matchedTexts([term('alpha')])).toEqual([['alpha']]);
    });

    it('should identify keywords by position and skip the ones not found', () => {
      render('<p>alpha gamma</p>');
      const words = getWordsHighlights([term('alpha'), term('beta'), term('gamma')], iframe);
      expect(Object.keys(words)).toEqual(['1', '3']);
      expect(words['3'].text).toBe('gamma');
    });

    it('should give each keyword a color from the Search API palette', () => {
      render('<p>alpha beta</p>');
      const words = getWordsHighlights([term('alpha'), term('beta')], iframe);
      expect(words['1'].color).toBe('rgb(176, 255, 255)');
      expect(words['2'].color).toBe('rgb(191, 191, 255)');
    });

    it('should not modify the document', () => {
      const html = '<p>Com<b>munity</b> admin metrics</p>';
      render(html);
      getWordsHighlights([term('community'), phrase('admin metrics')], iframe);
      expect(iframe.contentDocument!.body.innerHTML).toBe(html);
    });
  });
});
