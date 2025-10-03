import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import type {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {buildQuickviewPreviewBar} from './quickview-preview-bar';

describe('#buildQuickviewPreviewBar', () => {
  let mockIframe: HTMLIFrameElement;
  let mockDocument: Document;
  let mockBody: HTMLElement;
  let mockWordHighlight: QuickviewWordHighlight;
  let mockElement: HTMLElement;
  let highlightKeywords: HighlightKeywords;

  beforeEach(() => {
    document.body.innerHTML = '';

    mockIframe = document.createElement('iframe');

    mockDocument = document.implementation.createHTMLDocument('test');
    mockBody = mockDocument.createElement('body');
    mockDocument.body = mockBody;

    Object.defineProperty(mockBody, 'scrollHeight', {
      value: 1000,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(mockIframe, 'contentDocument', {
      value: mockDocument,
      writable: true,
    });

    mockElement = mockDocument.createElement('span');
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 100,
      left: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
    });

    mockWordHighlight = {
      text: 'test',
      color: '#ff0000',
      previewBorderColor: '#ff0000',
      elements: [mockElement],
    } as QuickviewWordHighlight;

    highlightKeywords = {
      highlightNone: false,
      keywords: {
        test: {
          indexIdentifier: 'test-id',
          enabled: true,
        },
      },
    };
  });

  it('should return early when iframe is undefined', () => {
    const words = {test: mockWordHighlight};

    buildQuickviewPreviewBar(words, highlightKeywords, undefined);

    expect(mockDocument.getElementById('CoveoPreviewBar')).toBeNull();
  });

  it('should return early when iframe contentDocument is null', () => {
    const words = {test: mockWordHighlight};
    Object.defineProperty(mockIframe, 'contentDocument', {
      value: null,
      writable: true,
    });

    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    expect(mockDocument.getElementById('CoveoPreviewBar')).toBeNull();
  });

  it('should create and append preview bar to document body', () => {
    const words = {test: mockWordHighlight};

    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);
    const previewBar = mockDocument.getElementById('CoveoPreviewBar');

    expect(previewBar).toBeTruthy();
    expect(mockDocument.body.contains(previewBar)).toBe(true);
  });

  it('should remove the preview bar from document when highlightKeywords.highlightNone is true', () => {
    const existingBar = mockDocument.createElement('div');
    existingBar.id = 'CoveoPreviewBar';
    mockDocument.body.appendChild(existingBar);

    const words = {test: mockWordHighlight};
    highlightKeywords.highlightNone = true;
    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    expect(mockDocument.getElementById('CoveoPreviewBar')).toBeNull();
  });

  it('should set correct preview bar styles and attributes', () => {
    const words = {test: mockWordHighlight};

    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    const previewBar = mockDocument.getElementById('CoveoPreviewBar');
    expect(previewBar?.style.position).toBe('fixed');
    expect(previewBar?.style.top).toBe('0px');
    expect(previewBar?.style.right).toBe('0px');
    expect(previewBar?.style.width).toBe('15px');
    expect(previewBar?.style.height).toBe('100%');
    expect(previewBar?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should clear existing preview bar inner HTML', () => {
    const existingBar = mockDocument.createElement('div');
    existingBar.id = 'CoveoPreviewBar';
    existingBar.innerHTML =
      '<div>existing content</div><div>some more content</div>';
    mockDocument.body.appendChild(existingBar);

    const words = {test: mockWordHighlight};
    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    const previewBar = mockDocument.getElementById('CoveoPreviewBar');
    expect(previewBar?.children.length).toBe(1);
  });

  it('should create preview unit with display none when highlight is disabled on a word', () => {
    const words = {test: mockWordHighlight};
    highlightKeywords.keywords.test.enabled = false;

    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    const previewBar = mockDocument.getElementById('CoveoPreviewBar');
    const previewUnit = previewBar?.children[0] as HTMLElement;
    expect(previewUnit?.style.display).toBe('none');
  });

  describe('when word highlight is enabled', () => {
    it('should create preview unit with correct position styles', () => {
      const words = {test: mockWordHighlight};

      buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

      const previewBar = mockDocument.getElementById('CoveoPreviewBar');
      const previewUnit = previewBar?.children[0] as HTMLElement;

      expect(previewUnit?.style.position).toBe('absolute');
      expect(previewUnit?.style.top).toBe('10%'); // (100 / 1000) * 100
      expect(previewUnit?.style.width).toBe('100%');
      expect(previewUnit?.style.height).toBe('1px');
    });

    it('should set preview unit colors from word highlight', () => {
      const words = {test: mockWordHighlight};

      buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

      const previewBar = mockDocument.getElementById('CoveoPreviewBar');
      const previewUnit = previewBar?.children[0] as HTMLElement;

      expect(previewUnit?.style.border).toBe(`1px solid rgb(255, 0, 0)`);
      expect(previewUnit?.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should create multiple preview units for multiple elements', () => {
      const secondElement = mockDocument.createElement('span');
      secondElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 200,
        left: 0,
        right: 100,
        bottom: 20,
        width: 100,
        height: 20,
      });

      mockWordHighlight.elements = [mockElement, secondElement];
      const words = {test: mockWordHighlight};

      buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

      const previewBar = mockDocument.getElementById('CoveoPreviewBar');
      expect(previewBar?.children.length).toBe(2);

      const firstUnit = previewBar?.children[0] as HTMLElement;
      const secondUnit = previewBar?.children[1] as HTMLElement;

      expect(firstUnit?.style.top).toBe('10%'); // (100 / 1000) * 100
      expect(secondUnit?.style.top).toBe('20%'); // (200 / 1000) * 100
    });

    it('should handle multiple word highlights', () => {
      const secondWordElement = mockDocument.createElement('span');
      secondWordElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 300,
        left: 0,
        right: 100,
        bottom: 20,
        width: 100,
        height: 20,
      });

      const secondWordHighlight = {
        text: 'another',
        color: '#00ff00',
        previewBorderColor: '#00ff00',
        elements: [secondWordElement],
      } as QuickviewWordHighlight;

      highlightKeywords.keywords.another = {
        indexIdentifier: 'another-id',
        enabled: true,
      };

      const words = {
        test: mockWordHighlight,
        another: secondWordHighlight,
      };

      buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

      const previewBar = mockDocument.getElementById('CoveoPreviewBar');
      expect(previewBar?.children.length).toBe(2);

      const firstUnit = previewBar?.children[0] as HTMLElement;
      const secondUnit = previewBar?.children[1] as HTMLElement;

      expect(firstUnit?.style.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(secondUnit?.style.backgroundColor).toBe('rgb(0, 255, 0)');
    });
  });

  it('should still create preview unit for unknown keywords when work highlight keyword is not in highlightKeywords', () => {
    const unknownWordHighlight = {
      text: 'unknown',
      color: '#0000ff',
      previewBorderColor: '#0000ff',
      elements: [mockElement],
    } as QuickviewWordHighlight;

    const words = {unknown: unknownWordHighlight};

    buildQuickviewPreviewBar(words, highlightKeywords, mockIframe);

    const previewBar = mockDocument.getElementById('CoveoPreviewBar');
    expect(previewBar?.children.length).toBe(1);

    const previewUnit = previewBar?.children[0] as HTMLElement;
    expect(previewUnit?.style.backgroundColor).toBe('rgb(0, 0, 255)');
    expect(previewUnit?.style.display).not.toBe('none');
  });

  describe('when document height is zero', () => {
    beforeEach(() => {
      Object.defineProperty(mockBody, 'scrollHeight', {
        value: 0,
        writable: true,
        configurable: true,
      });
    });

    it('should not throw', () => {
      expect(() => {
        buildQuickviewPreviewBar(
          {test: mockWordHighlight},
          highlightKeywords,
          mockIframe
        );
      }).not.toThrow();
    });

    it('should create a preview unit', () => {
      buildQuickviewPreviewBar(
        {test: mockWordHighlight},
        highlightKeywords,
        mockIframe
      );
      const previewBar = mockDocument.getElementById('CoveoPreviewBar');
      const previewUnit = previewBar?.children[0] as HTMLElement;

      expect(previewUnit).toBeTruthy();
      expect(previewBar?.contains(previewUnit)).toBe(true);
    });
  });
});
