import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {Product} from '@coveo/headless/commerce';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ProductContextEvent} from '../../commerce/product-template-components/product-template-decorators';
import {
  MissingParentError,
  ItemContext,
  InteractiveItemContext,
  itemContext,
  ChildTemplatesContext,
  ItemDisplayConfigContext,
} from './item-decorators';

const originalConnectedCallback = vi.fn();
const originalRender = vi.fn(() => '<div>rendered</div>');
const originalUpdated = vi.fn();

let parentElement: ParentElement;

@customElement('test-element')
class TestElement extends LitElement {
  connectedCallback = originalConnectedCallback;
  render = originalRender;
  updated = originalUpdated;

  @state() error!: Error;
  product!: Product;
}

@customElement('parent-element')
class ParentElement extends LitElement {
  @state() product = {
    children: [buildFakeProduct({ec_name: 'Child Product'})],
    result: buildFakeProduct({
      ec_name: 'Test Product',
    }),
  };

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(
      'atomic/resolveResult',
      this.resolveProduct as EventListener
    );
  }

  public resolveProduct = (event: ProductContextEvent) => {
    console.log('resolveProduct', this.product);
    event.preventDefault();
    event.stopPropagation();
    event.detail(this.product as unknown as Product);
  };
}

describe('item-decorators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#MissingParentError', () => {
    it('should create error with correct message when provided element and parent names', () => {
      const error = new MissingParentError('child-element', 'parent-element');

      expect(error.message).toBe(
        'The "child-element" element must be the child of an "parent-element" element.'
      );
    });

    describe('#ItemContext', () => {
      it('should return a decorator function', () => {
        const decorator = ItemContext();

        expect(typeof decorator).toBe('function');
      });

      it('should accept custom options', () => {
        const customOptions = {
          parentName: 'custom-parent',
          folded: true,
        };
        const decorator = ItemContext(customOptions);

        expect(typeof decorator).toBe('function');
      });

      it('should use default options when no options provided', () => {
        const decorator = ItemContext();

        expect(typeof decorator).toBe('function');
      });

      describe('when applied to a component', () => {
        let mockComponent: TestElement;

        const setupElement = (options?: Parameters<typeof ItemContext>[0]) => {
          mockComponent = new TestElement();

          vi.spyOn(console, 'error').mockImplementation(() => {});
          vi.spyOn(mockComponent, 'remove').mockImplementation(() => {});

          const decorator = ItemContext(options);
          decorator(mockComponent as never, 'product');

          parentElement.appendChild(mockComponent);

          return mockComponent;
        };

        beforeEach(async () => {
          parentElement = document.createElement(
            'parent-element'
          ) as ParentElement;

          document.body.appendChild(parentElement);

          await parentElement.updateComplete;
        });

        it('should wrap the #connectedCallback method', () => {
          setupElement();

          expect(mockComponent.connectedCallback).not.toBe(
            originalConnectedCallback
          );
          expect(typeof mockComponent.connectedCallback).toBe('function');
        });

        it('should dispatch an event in #connectedCallback', () => {
          setupElement();
          const dispatchEventSpy = vi
            .spyOn(mockComponent, 'dispatchEvent')
            .mockReturnValue(false);

          mockComponent.connectedCallback?.();

          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'atomic/resolveResult',
            })
          );
        });

        it('should call original #connectedCallback when event is not canceled', () => {
          setupElement();
          vi.spyOn(mockComponent, 'dispatchEvent').mockReturnValue(false);

          mockComponent.connectedCallback?.();

          expect(originalConnectedCallback).toHaveBeenCalled();
        });

        it('should set error when event is canceled in #connectedCallback', () => {
          setupElement({
            parentName: 'custom-parent',
            folded: false,
          });
          vi.spyOn(mockComponent, 'dispatchEvent').mockReturnValue(true);

          mockComponent.connectedCallback?.();

          expect(mockComponent.error).toBeInstanceOf(MissingParentError);
          expect(mockComponent.error?.message).toBe(
            'The "test-element" element must be the child of an "custom-parent" element.'
          );
          expect(originalConnectedCallback).not.toHaveBeenCalled();
        });

        it('should wrap the #render method', () => {
          setupElement();

          expect(mockComponent.render).not.toBe(originalRender);
          expect(typeof mockComponent.render).toBe('function');
        });

        it('should call original #render when no error', () => {
          setupElement();

          const result = mockComponent.render?.();

          expect(originalRender).toHaveBeenCalled();
          expect(result).toBe('<div>rendered</div>');
        });

        it('should remove element and log error in #render when error exists', () => {
          setupElement();
          mockComponent.error = new Error('Test error');

          mockComponent.render?.();

          expect(mockComponent.remove).toHaveBeenCalled();
          expect(console.error).toHaveBeenCalledWith(
            'Result component is in error and has been removed from the DOM',
            mockComponent.error,
            mockComponent,
            mockComponent
          );
          expect(originalRender).not.toHaveBeenCalled();
        });

        it('should wrap the #updated method', () => {
          setupElement();

          expect(mockComponent.updated).not.toBe(originalUpdated);
          expect(typeof mockComponent.updated).toBe('function');
        });

        it('should call original #updated when no error', () => {
          setupElement();
          const args = ['arg1', 'arg2'];

          mockComponent.updated?.(...args);

          expect(originalUpdated).toHaveBeenCalledWith(...args);
        });

        it('should not call original #updated when error exists', () => {
          setupElement();
          mockComponent.error = new Error('Test error');

          mockComponent.updated?.('arg1', 'arg2');

          expect(originalUpdated).not.toHaveBeenCalled();
        });

        it('should set product from parent element in #connectedCallback', async () => {
          setupElement({
            parentName: 'parent-element',
            folded: false,
          });

          mockComponent.connectedCallback?.();

          expect(mockComponent.product).toEqual(parentElement.product.result);
        });

        it('should extract folded item when folded option is true', async () => {
          setupElement({
            parentName: 'parent-element',
            folded: true,
          });

          mockComponent.connectedCallback?.();

          expect(mockComponent.product.children).toHaveLength(1);
        });
      });
    });

    describe('#InteractiveItemContext', () => {
      it('should return a decorator function', () => {
        const decorator = InteractiveItemContext();

        expect(typeof decorator).toBe('function');
      });
    });

    describe('#itemContext', () => {
      it('should return a Promise', () => {
        const mockElement = document.createElement('div');
        const mockParent = document.createElement('parent-element');
        mockParent.appendChild(mockElement);
        const result = itemContext(mockElement, 'parent-element');

        expect(result).toBeInstanceOf(Promise);
      });
    });

    describe('#ChildTemplatesContext', () => {
      it('should return a decorator function', () => {
        const decorator = ChildTemplatesContext();

        expect(typeof decorator).toBe('function');
      });
    });

    describe('#ItemDisplayConfigContext', () => {
      it('should return a decorator function', () => {
        const decorator = ItemDisplayConfigContext();

        expect(typeof decorator).toBe('function');
      });
    });
  });
});
