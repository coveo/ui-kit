import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {randomID} from '@/src/utils/utils';
import {
  LayoutStylesController,
  type LayoutStylesHost,
} from './layout-styles-controller';

vi.mock('@/src/utils/utils', {spy: true});

@customElement('test-layout-element')
class TestLayoutElement extends LitElement implements LayoutStylesHost {
  mobileBreakpoint = '900px';
  id!: string;

  getRootNode(): Node {
    return document;
  }
}

describe('LayoutStylesController', () => {
  let mockElement: TestLayoutElement;
  let mockStylesBuilder: ReturnType<typeof vi.fn>;
  let controller: LayoutStylesController;

  const createMockStyleSheet = () => {
    const mockStyleSheet = {
      replaceSync: vi.fn(),
    } as unknown as CSSStyleSheet;
    vi.stubGlobal(
      'CSSStyleSheet',
      vi.fn().mockImplementation(function (this: unknown) {
        return mockStyleSheet;
      })
    );
    return mockStyleSheet;
  };

  beforeEach(() => {
    vi.mocked(randomID).mockImplementation(
      (prefix) => `${prefix}mock-id-12345`
    );
    mockElement = new TestLayoutElement();
    mockStylesBuilder = vi.fn().mockReturnValue('.test-styles { color: red; }');

    Object.defineProperty(document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
    });

    vi.spyOn(mockElement, 'addController');
  });

  describe('#constructor', () => {
    beforeEach(() => {
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'test-component'
      );
    });

    it('should initialize with provided parameters', () => {
      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    it('should store the styles builder function', () => {
      expect(mockStylesBuilder).toBeDefined();
    });
  });

  describe('#hostConnected', () => {
    beforeEach(() => {
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'test-component'
      );
    });

    it('should assign random ID when host has no ID', () => {
      controller.hostConnected();

      expect(vi.mocked(randomID)).toHaveBeenCalledWith('test-component');
      expect(mockElement.id).toBe('test-componentmock-id-12345');
    });

    it('should not override existing ID', () => {
      mockElement.id = 'existing-id';
      controller.hostConnected();

      expect(mockElement.id).toBe('existing-id');
    });

    it('should call updateStyles', async () => {
      Object.defineProperty(mockElement, 'updateComplete', {
        get: () => Promise.resolve(true),
        configurable: true,
      });
      const updateStylesSpy = vi.spyOn(controller, 'updateStyles');
      controller.hostConnected();

      await mockElement.updateComplete;
      expect(updateStylesSpy).toHaveBeenCalled();
    });
  });

  describe('#updateStyles', () => {
    let mockStyleSheet: CSSStyleSheet;

    beforeEach(() => {
      mockStyleSheet = createMockStyleSheet();
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'test-component'
      );
    });

    it('should call styles builder with correct parameters', () => {
      controller.updateStyles();

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, '900px');
    });

    it('should create new CSSStyleSheet when none exists', () => {
      controller.updateStyles();

      expect(globalThis.CSSStyleSheet).toHaveBeenCalled();
      expect(mockStyleSheet.replaceSync).toHaveBeenCalledWith(
        '.test-styles { color: red; }'
      );
      expect(document.adoptedStyleSheets).toContain(mockStyleSheet);
    });

    it('should reuse existing stylesheet on subsequent calls', () => {
      controller.updateStyles();
      expect(globalThis.CSSStyleSheet).toHaveBeenCalledTimes(1);

      mockStylesBuilder.mockReturnValue('.updated-styles { color: blue; }');
      controller.updateStyles();

      expect(globalThis.CSSStyleSheet).toHaveBeenCalledTimes(1);
      expect(mockStyleSheet.replaceSync).toHaveBeenCalledWith(
        '.updated-styles { color: blue; }'
      );
    });

    it('should handle different mobile breakpoint values', () => {
      mockElement.mobileBreakpoint = '1024px';

      controller.updateStyles();

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, '1024px');
    });

    describe('when getRootNode returns ShadowRoot', () => {
      let mockShadowRoot: ShadowRoot;

      beforeEach(() => {
        mockShadowRoot = {
          adoptedStyleSheets: [],
        } as unknown as ShadowRoot;

        Object.setPrototypeOf(mockShadowRoot, ShadowRoot.prototype);

        vi.spyOn(mockElement, 'getRootNode').mockReturnValue(mockShadowRoot);
      });

      it('should add stylesheet to ShadowRoot', () => {
        controller.updateStyles();

        expect(mockShadowRoot.adoptedStyleSheets).toContain(mockStyleSheet);
      });

      it('should preserve existing stylesheets in ShadowRoot', () => {
        const existingSheet = {} as CSSStyleSheet;
        mockShadowRoot.adoptedStyleSheets = [existingSheet];

        controller.updateStyles();

        expect(mockShadowRoot.adoptedStyleSheets).toEqual([
          existingSheet,
          mockStyleSheet,
        ]);
      });
    });

    describe('when getRootNode returns invalid parent', () => {
      beforeEach(() => {
        const invalidParent = {} as Node;
        vi.spyOn(mockElement, 'getRootNode').mockReturnValue(invalidParent);
      });

      it('should not create stylesheet for invalid parent', () => {
        controller.updateStyles();

        expect(globalThis.CSSStyleSheet).not.toHaveBeenCalled();
      });

      it('should not call styles builder', () => {
        controller.updateStyles();

        expect(mockStylesBuilder).not.toHaveBeenCalledWith(
          mockElement,
          '900px'
        );
      });
    });
  });
});
