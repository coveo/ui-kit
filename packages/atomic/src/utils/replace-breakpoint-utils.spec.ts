import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as domUtils from './dom-utils';
import {
  DEFAULT_MOBILE_BREAKPOINT,
  updateBreakpoints,
} from './replace-breakpoint-utils';

vi.mock('./dom-utils', {spy: true});

describe('replace-breakpoint-utils', () => {
  let mockElement: HTMLElement;
  let mockShadowRoot: ShadowRoot;
  let mockStyleSheet: CSSStyleSheet;
  let mockStyleTag: HTMLStyleElement;

  beforeEach(() => {
    mockStyleSheet = {
      cssRules: [
        {
          cssText: `@media (min-width: ${DEFAULT_MOBILE_BREAKPOINT}) { .test { color: red; } }`,
        },
        {cssText: '.other { color: blue; }'},
      ],
      replaceSync: vi.fn(),
    } as unknown as CSSStyleSheet;

    mockStyleTag = {
      textContent: `@media (min-width: ${DEFAULT_MOBILE_BREAKPOINT}) { .mobile { display: block; } }`,
    } as HTMLStyleElement;

    mockShadowRoot = {
      adoptedStyleSheets: [mockStyleSheet],
      querySelector: vi.fn().mockReturnValue(mockStyleTag),
    } as unknown as ShadowRoot;

    mockElement = {
      shadowRoot: mockShadowRoot,
    } as HTMLElement;
  });

  describe('#updateBreakpoints', () => {
    it('should do nothing when no layout element is found', () => {
      vi.mocked(domUtils.closest).mockReturnValue(null);

      updateBreakpoints(mockElement);

      expect(mockStyleSheet.replaceSync).not.toHaveBeenCalled();
    });

    it('should do nothing when layout element has no mobileBreakpoint', () => {
      const mockLayout = {} as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(mockElement);

      expect(mockStyleSheet.replaceSync).not.toHaveBeenCalled();
    });

    it('should do nothing when mobileBreakpoint equals DEFAULT_MOBILE_BREAKPOINT', () => {
      const mockLayout = {
        mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(mockElement);

      expect(mockStyleSheet.replaceSync).not.toHaveBeenCalled();
    });

    it('should replace breakpoints in stylesheet when different mobileBreakpoint is provided', () => {
      const customBreakpoint = '768px';
      const mockLayout = {
        mobileBreakpoint: customBreakpoint,
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(mockElement);

      expect(mockStyleSheet.replaceSync).toHaveBeenCalledWith(
        `@media (width >= ${customBreakpoint}) { .test { color: red; } }.other { color: blue; }`
      );
    });

    it('should replace breakpoints in style tag when different mobileBreakpoint is provided', () => {
      const customBreakpoint = '768px';
      const mockLayout = {
        mobileBreakpoint: customBreakpoint,
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(mockElement);

      expect(mockStyleTag.textContent).toBe(
        `@media (width >= ${customBreakpoint}) { .mobile { display: block; } }`
      );
    });

    it('should handle element with no shadow root', () => {
      const elementWithoutShadow = {} as HTMLElement;
      const mockLayout = {
        mobileBreakpoint: '768px',
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      expect(() => updateBreakpoints(elementWithoutShadow)).not.toThrow();
    });

    it('should handle shadow root with no adopted stylesheets', () => {
      const shadowWithoutStylesheets = {
        adoptedStyleSheets: [],
        querySelector: vi.fn().mockReturnValue(mockStyleTag),
      } as unknown as ShadowRoot;
      const elementWithEmptyStylesheets = {
        shadowRoot: shadowWithoutStylesheets,
      } as HTMLElement;
      const mockLayout = {
        mobileBreakpoint: '768px',
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(elementWithEmptyStylesheets);

      expect(mockStyleTag.textContent).toBe(
        '@media (width >= 768px) { .mobile { display: block; } }'
      );
    });

    it('should handle shadow root with no style tag', () => {
      const shadowWithoutStyleTag = {
        adoptedStyleSheets: [mockStyleSheet],
        querySelector: vi.fn().mockReturnValue(null),
      } as unknown as ShadowRoot;
      const elementWithoutStyleTag = {
        shadowRoot: shadowWithoutStyleTag,
      } as HTMLElement;
      const mockLayout = {
        mobileBreakpoint: '768px',
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(elementWithoutStyleTag);

      expect(mockStyleSheet.replaceSync).toHaveBeenCalled();
    });

    it('should call closest with layout selectors', () => {
      const mockLayout = {
        mobileBreakpoint: '768px',
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      updateBreakpoints(mockElement);

      expect(domUtils.closest).toHaveBeenCalledWith(
        mockElement,
        'atomic-search-layout, atomic-insight-layout'
      );
    });

    it('should replace both min-width and width >= media queries', () => {
      const customBreakpoint = '768px';
      const mockLayout = {
        mobileBreakpoint: customBreakpoint,
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      // Test with both query formats
      const mockStyleSheetWithBothQueries = {
        cssRules: [
          {
            cssText: `@media (min-width: ${DEFAULT_MOBILE_BREAKPOINT}) { .test1 { color: red; } }`,
          },
          {
            cssText: `@media (width >= ${DEFAULT_MOBILE_BREAKPOINT}) { .test2 { color: blue; } }`,
          },
        ],
        replaceSync: vi.fn(),
      } as unknown as CSSStyleSheet;

      mockShadowRoot.adoptedStyleSheets = [mockStyleSheetWithBothQueries];

      updateBreakpoints(mockElement);

      expect(mockStyleSheetWithBothQueries.replaceSync).toHaveBeenCalledWith(
        `@media (width >= ${customBreakpoint}) { .test1 { color: red; } }@media (width >= ${customBreakpoint}) { .test2 { color: blue; } }`
      );
    });

    it('should handle style tag with null textContent', () => {
      const styleTagWithNullContent = {
        textContent: null,
      } as unknown;
      const shadowWithNullContent = {
        adoptedStyleSheets: [],
        querySelector: vi.fn().mockReturnValue(styleTagWithNullContent),
      } as unknown as ShadowRoot;
      const elementWithNullContent = {
        shadowRoot: shadowWithNullContent,
      } as HTMLElement;
      const mockLayout = {
        mobileBreakpoint: '768px',
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      // The implementation uses textContent! so it will throw on null
      expect(() => updateBreakpoints(elementWithNullContent)).toThrow();
    });

    it('should preserve non-matching media queries unchanged', () => {
      const customBreakpoint = '768px';
      const mockLayout = {
        mobileBreakpoint: customBreakpoint,
      } as HTMLElement & {mobileBreakpoint: string};
      vi.mocked(domUtils.closest).mockReturnValue(mockLayout);

      const mockStyleSheetWithMixedQueries = {
        cssRules: [
          {cssText: '@media (max-width: 500px) { .small { display: none; } }'},
          {
            cssText: `@media (min-width: ${DEFAULT_MOBILE_BREAKPOINT}) { .large { display: block; } }`,
          },
        ],
        replaceSync: vi.fn(),
      } as unknown as CSSStyleSheet;

      mockShadowRoot.adoptedStyleSheets = [mockStyleSheetWithMixedQueries];

      updateBreakpoints(mockElement);

      expect(mockStyleSheetWithMixedQueries.replaceSync).toHaveBeenCalledWith(
        `@media (max-width: 500px) { .small { display: none; } }@media (width >= ${customBreakpoint}) { .large { display: block; } }`
      );
    });
  });
});
