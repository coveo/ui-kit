import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnyItem} from '@/src/components/common/item-list/unfolded-item';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {
  CustomRenderController,
  type CustomRenderHost,
  type CustomRenderOptions,
} from './custom-render-controller';

@customElement('test-custom-render-element')
class TestCustomRenderElement extends LitElement implements CustomRenderHost {
  addController = vi.fn();

  getRootNode(): Node {
    return this.shadowRoot || document;
  }
}

describe('CustomRenderController', () => {
  let mockElement: TestCustomRenderElement;
  let mockOptions: CustomRenderOptions;
  let controller: CustomRenderController;
  let mockRootElement: HTMLElement;
  let mockLinkContainer: HTMLElement;
  let mockItemData: AnyItem;
  let mockRenderingFunction: ReturnType<typeof vi.fn>;
  let mockOnRenderComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockElement = new TestCustomRenderElement();
    mockRootElement = document.createElement('div');
    mockLinkContainer = document.createElement('div');
    mockItemData = buildFakeProduct();

    mockRenderingFunction = vi
      .fn()
      .mockReturnValue('<div>Custom render output</div>');
    mockOnRenderComplete = vi.fn();

    mockOptions = {
      renderingFunction: vi.fn().mockReturnValue(mockRenderingFunction),
      itemData: vi.fn().mockReturnValue(mockItemData),
      rootElementRef: vi.fn().mockReturnValue(mockRootElement),
      linkContainerRef: vi.fn().mockReturnValue(mockLinkContainer),
      onRenderComplete: mockOnRenderComplete,
    };
  });

  describe('#constructor', () => {
    beforeEach(() => {
      controller = new CustomRenderController(mockElement, mockOptions);
    });

    it('should initialize with provided parameters', () => {
      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });
  });

  describe('#hostConnected', () => {
    beforeEach(() => {
      controller = new CustomRenderController(mockElement, mockOptions);
    });

    it('should reset state', () => {
      controller.hostUpdated();
      expect(mockRenderingFunction).toHaveBeenCalledTimes(1);

      controller.hostConnected();

      controller.hostUpdated();
      expect(mockRenderingFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('#hostUpdated', () => {
    beforeEach(() => {
      controller = new CustomRenderController(mockElement, mockOptions);
    });

    it('should execute render function when conditions are met', () => {
      controller.hostUpdated();

      expect(mockRenderingFunction).toHaveBeenCalledWith(
        mockItemData,
        mockRootElement,
        mockLinkContainer
      );
    });

    it('should call onRenderComplete callback with correct parameters', () => {
      controller.hostUpdated();

      expect(mockOnRenderComplete).toHaveBeenCalledWith(
        mockRootElement,
        '<div>Custom render output</div>'
      );
    });

    it('should execute render function only once per cycle', () => {
      controller.hostUpdated();
      controller.hostUpdated();
      controller.hostUpdated();

      expect(mockRenderingFunction).toHaveBeenCalledTimes(1);
      expect(mockOnRenderComplete).toHaveBeenCalledTimes(1);
    });

    it('should not execute when rendering function is undefined', () => {
      mockOptions.renderingFunction = vi.fn().mockReturnValue(undefined);
      controller = new CustomRenderController(mockElement, mockOptions);

      controller.hostUpdated();

      expect(mockRenderingFunction).not.toHaveBeenCalled();
      expect(mockOnRenderComplete).not.toHaveBeenCalled();
    });

    it('should not execute when item data is undefined', () => {
      mockOptions.itemData = vi.fn().mockReturnValue(undefined);
      controller = new CustomRenderController(mockElement, mockOptions);

      controller.hostUpdated();

      expect(mockRenderingFunction).not.toHaveBeenCalled();
      expect(mockOnRenderComplete).not.toHaveBeenCalled();
    });

    it('should not execute when root element ref is undefined', () => {
      mockOptions.rootElementRef = vi.fn().mockReturnValue(undefined);
      controller = new CustomRenderController(mockElement, mockOptions);

      controller.hostUpdated();

      expect(mockRenderingFunction).not.toHaveBeenCalled();
      expect(mockOnRenderComplete).not.toHaveBeenCalled();
    });

    it('should execute when link container ref is undefined', () => {
      mockOptions.linkContainerRef = vi.fn().mockReturnValue(undefined);
      controller = new CustomRenderController(mockElement, mockOptions);

      controller.hostUpdated();

      expect(mockRenderingFunction).toHaveBeenCalledWith(
        mockItemData,
        mockRootElement,
        undefined
      );
      expect(mockOnRenderComplete).toHaveBeenCalled();
    });

    it('should handle rendering function that returns different output types', () => {
      const testCases = [
        '',
        '<div>Empty content</div>',
        '<span>Multiple</span><div>Elements</div>',
        'Plain text content',
      ];

      testCases.forEach((output) => {
        mockRenderingFunction.mockReturnValue(output);
        controller.hostConnected();
        controller.hostUpdated();

        expect(mockOnRenderComplete).toHaveBeenLastCalledWith(
          mockRootElement,
          output
        );
      });
    });
  });
});
