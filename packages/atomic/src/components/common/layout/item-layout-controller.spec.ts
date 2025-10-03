import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as displayOptions from './display-options';
import {
  ItemLayoutController,
  type ItemLayoutHost,
  type ItemLayoutOptions,
} from './item-layout-controller';

vi.mock('./display-options');

const mockGetClasses = vi.fn();
const MockedItemLayout = vi.mocked(displayOptions.ItemLayout);

MockedItemLayout.mockImplementation(
  () =>
    ({
      getClasses: mockGetClasses,
    }) as unknown as displayOptions.ItemLayout
);

@customElement('test-item-element')
class TestItemElement extends LitElement implements ItemLayoutHost {
  addController = vi.fn();

  getRootNode(): Node {
    return this.shadowRoot || document;
  }
}

describe('ItemLayoutController', () => {
  let mockElement: TestItemElement;
  let mockOptions: ItemLayoutOptions;
  let controller: ItemLayoutController;
  let mockContent: HTMLDivElement;

  beforeEach(() => {
    mockElement = new TestItemElement();
    mockContent = document.createElement('div');
    mockContent.appendChild(document.createElement('atomic-result-title'));
    mockContent.appendChild(document.createElement('atomic-result-excerpt'));

    mockOptions = {
      elementPrefix: 'atomic-result',
      hasCustomRenderFunction: vi.fn().mockReturnValue(false),
      content: vi.fn().mockReturnValue(mockContent),
      layoutConfig: vi.fn().mockReturnValue({
        display: 'list',
        density: 'normal',
        imageSize: 'icon',
      }),
      itemClasses: vi.fn().mockReturnValue('custom-class extra-class'),
    };

    mockGetClasses.mockReturnValue([
      'display-list',
      'density-normal',
      'image-icon',
    ]);

    MockedItemLayout.mockImplementation(
      () =>
        ({
          getClasses: mockGetClasses,
        }) as unknown as displayOptions.ItemLayout
    );

    Object.defineProperty(mockElement, 'shadowRoot', {
      value: {
        querySelector: vi.fn(),
      } as unknown as ShadowRoot,
      writable: true,
      configurable: true,
    });

    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('#constructor', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
    });

    it('should initialize with provided parameters', () => {
      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    it('should store the options', () => {
      expect(mockOptions.elementPrefix).toBe('atomic-result');
    });
  });

  describe('#hostConnected', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
    });

    it('should create layout with correct parameters when content is provided', () => {
      controller.hostConnected();

      expect(MockedItemLayout).toHaveBeenCalledWith(
        mockContent.children,
        'list',
        'normal',
        'icon'
      );
    });

    it('should handle undefined content gracefully', () => {
      mockOptions.content = vi.fn().mockReturnValue(undefined);
      controller = new ItemLayoutController(mockElement, mockOptions);

      expect(() => controller.hostConnected()).not.toThrow();
      expect(controller.getLayout()).toBeNull();
    });
  });

  describe('#hostDisconnected', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
    });

    it('should not throw when called', () => {
      expect(() => controller.hostDisconnected()).not.toThrow();
    });
  });

  describe('#hostUpdated', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();
    });

    it('should handle layout updates when not in custom render mode', () => {
      const mockRoot = document.createElement('div');
      mockRoot.className = 'result-root';
      const element1 = document.createElement('atomic-result-title');
      const element2 = document.createElement('atomic-result-excerpt');
      mockRoot.appendChild(element1);
      mockRoot.appendChild(element2);

      vi.spyOn(mockElement.shadowRoot!, 'querySelector').mockReturnValue(
        mockRoot
      );

      controller.hostUpdated();

      expect(element1.classList.contains('display-list')).toBe(true);
      expect(element2.classList.contains('display-list')).toBe(true);
    });

    it('should not apply layout classes when custom render mode with disabled classes', () => {
      mockOptions.hasCustomRenderFunction = vi.fn().mockReturnValue(true);
      mockOptions.disableLayoutClassesForCustomRender = vi
        .fn()
        .mockReturnValue(true);
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      const mockRoot = document.createElement('div');
      mockRoot.className = 'result-root';
      const element1 = document.createElement('atomic-result-title');
      mockRoot.appendChild(element1);

      vi.spyOn(mockElement.shadowRoot!, 'querySelector').mockReturnValue(
        mockRoot
      );

      controller.hostUpdated();

      expect(element1.classList.contains('display-list')).toBe(false);
    });
  });

  describe('#getLayout', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
    });

    it('should return layout instance when created', () => {
      controller.hostConnected();
      const layout = controller.getLayout();

      expect(layout).toBeDefined();
      expect(layout).not.toBeNull();
    });

    it('should return null when content is undefined', () => {
      mockOptions.content = vi.fn().mockReturnValue(undefined);
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      expect(controller.getLayout()).toBeNull();
    });
  });

  describe('#getCombinedClasses', () => {
    beforeEach(() => {
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();
    });

    it('should return combined layout and item classes', () => {
      const classes = controller.getCombinedClasses();

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-icon',
        'custom-class',
        'extra-class',
      ]);
    });

    it('should pass additional content to layout.getClasses', () => {
      const additionalContent =
        '<atomic-result-section-visual></atomic-result-section-visual>';

      controller.getCombinedClasses(additionalContent);

      expect(mockGetClasses).toHaveBeenCalledWith(additionalContent);
    });

    it('should filter out empty item classes', () => {
      mockOptions.itemClasses = vi.fn().mockReturnValue('  class1    class2  ');
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      const classes = controller.getCombinedClasses();

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-icon',
        'class1',
        'class2',
      ]);
    });

    it('should return only layout classes when item classes are empty', () => {
      mockOptions.itemClasses = vi.fn().mockReturnValue('');
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      const classes = controller.getCombinedClasses();

      expect(classes).toEqual(['display-list', 'density-normal', 'image-icon']);
    });

    it('should return only item classes when layout is null', () => {
      mockOptions.content = vi.fn().mockReturnValue(undefined);
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      const classes = controller.getCombinedClasses();

      expect(classes).toEqual(['custom-class', 'extra-class']);
    });
  });

  describe('#applyLayoutClassesToElement', () => {
    let testElement: HTMLElement;

    beforeEach(() => {
      testElement = document.createElement('atomic-result-title');
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();
    });

    it('should apply classes to the specified element', () => {
      controller.applyLayoutClassesToElement(testElement);

      expect(testElement.classList.contains('display-list')).toBe(true);
      expect(testElement.classList.contains('density-normal')).toBe(true);
      expect(testElement.classList.contains('image-icon')).toBe(true);
      expect(testElement.classList.contains('custom-class')).toBe(true);
      expect(testElement.classList.contains('extra-class')).toBe(true);
    });

    it('should pass additional content to getCombinedClasses', () => {
      const additionalContent =
        '<atomic-result-section-visual></atomic-result-section-visual>';
      vi.spyOn(controller, 'getCombinedClasses');

      controller.applyLayoutClassesToElement(testElement, additionalContent);

      expect(controller.getCombinedClasses).toHaveBeenCalledWith(
        additionalContent
      );
    });

    it('should not apply classes when layout is null', () => {
      mockOptions.content = vi.fn().mockReturnValue(undefined);
      controller = new ItemLayoutController(mockElement, mockOptions);
      controller.hostConnected();

      controller.applyLayoutClassesToElement(testElement);

      expect(testElement.classList.length).toBe(0);
    });

    it('should not apply classes when classes array is empty', () => {
      vi.mocked(mockOptions.itemClasses).mockReturnValue('');
      mockGetClasses.mockReturnValue([]);

      controller.applyLayoutClassesToElement(testElement);

      expect(testElement.classList.length).toBe(0);
    });
  });
});
