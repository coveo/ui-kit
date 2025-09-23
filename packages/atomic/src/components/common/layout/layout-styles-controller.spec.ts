import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {randomID} from '@/src/utils/utils';
import {
  LayoutStylesController,
  type LayoutStylesHost,
} from './layout-styles-controller';

vi.mock('@/src/utils/utils', () => ({
  randomID: vi.fn((prefix: string) => `${prefix}mock-id-12345`),
}));

@customElement('test-layout-element')
class TestLayoutElement extends LitElement implements LayoutStylesHost {
  mobileBreakpoint = 'small';
  id!: string;

  getRootNode(): Node {
    return document;
  }
}

describe('layout-styles-controller', () => {
  let mockElement: TestLayoutElement;
  let mockStylesBuilder: ReturnType<typeof vi.fn>;
  let controller: LayoutStylesController;

  const createMockStyleSheet = () => {
    const mockStyleSheet = {
      replaceSync: vi.fn(),
    } as unknown as CSSStyleSheet;

    globalThis.CSSStyleSheet = vi.fn(() => mockStyleSheet);
    return mockStyleSheet;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockElement = new TestLayoutElement();
    mockStylesBuilder = vi.fn().mockReturnValue('.test-styles { color: red; }');

    // Reset document.adoptedStyleSheets
    Object.defineProperty(document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
    });

    vi.spyOn(mockElement, 'addController');
  });

  describe('#constructor', () => {
    it('should initialize with provided parameters', () => {
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'test-component'
      );

      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    it('should store the styles builder function', () => {
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'test-component'
      );

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

    it('should call updateStyles', () => {
      const updateStylesSpy = vi.spyOn(controller, 'updateStyles');

      controller.hostConnected();

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

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'small');
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
      // First call creates stylesheet
      controller.updateStyles();
      expect(globalThis.CSSStyleSheet).toHaveBeenCalledTimes(1);

      // Second call should reuse
      mockStylesBuilder.mockReturnValue('.updated-styles { color: blue; }');
      controller.updateStyles();

      expect(globalThis.CSSStyleSheet).toHaveBeenCalledTimes(1);
      expect(mockStyleSheet.replaceSync).toHaveBeenCalledWith(
        '.updated-styles { color: blue; }'
      );
    });

    it('should handle different mobile breakpoint values', () => {
      mockElement.mobileBreakpoint = 'medium';

      controller.updateStyles();

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'medium');
    });

    describe('when getRootNode returns ShadowRoot', () => {
      let mockShadowRoot: ShadowRoot;

      beforeEach(() => {
        // Mock ShadowRoot for instanceof checks
        mockShadowRoot = {
          adoptedStyleSheets: [],
        } as unknown as ShadowRoot;

        // Override the prototype to make instanceof work
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

      it('should still call styles builder', () => {
        controller.updateStyles();

        expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'small');
      });
    });

    it('should handle styles builder returning empty string', () => {
      mockStylesBuilder.mockReturnValue('');

      controller.updateStyles();

      expect(mockStyleSheet.replaceSync).toHaveBeenCalledWith('');
    });

    it('should handle styles builder throwing error', () => {
      mockStylesBuilder.mockImplementation(() => {
        throw new Error('Styles builder error');
      });

      expect(() => controller.updateStyles()).toThrow('Styles builder error');
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      createMockStyleSheet();
    });

    it('should work correctly with full lifecycle', () => {
      controller = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'integration-test'
      );

      // Connect host
      controller.hostConnected();

      // Verify ID assignment
      expect(mockElement.id).toBe('integration-testmock-id-12345');

      // Verify styles are applied
      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'small');

      // Change breakpoint and update
      mockElement.mobileBreakpoint = 'large';
      mockStylesBuilder.mockReturnValue('.large-styles { display: block; }');

      controller.updateStyles();

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'large');
    });

    it('should handle multiple controllers on same element', () => {
      const secondStylesBuilder = vi
        .fn()
        .mockReturnValue('.second-styles { margin: 10px; }');

      const firstController = new LayoutStylesController(
        mockElement,
        mockStylesBuilder,
        'first'
      );

      const secondController = new LayoutStylesController(
        mockElement,
        secondStylesBuilder,
        'second'
      );

      firstController.hostConnected();
      secondController.hostConnected();

      expect(mockStylesBuilder).toHaveBeenCalledWith(mockElement, 'small');
      expect(secondStylesBuilder).toHaveBeenCalledWith(mockElement, 'small');

      // Should have two stylesheets in adoptedStyleSheets
      expect(document.adoptedStyleSheets).toHaveLength(2);
    });
  });
});
