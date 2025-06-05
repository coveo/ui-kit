import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ItemContext, MissingParentError} from './item-context';

const originalConnectedCallback = vi.fn();
const originalRender = vi.fn(() => '<div>rendered</div>');
const originalUpdated = vi.fn();

@customElement('test-element')
class TestElement extends LitElement {
  connectedCallback = originalConnectedCallback;
  render = originalRender;
  updated = originalUpdated;

  @state() error!: Error;
}

describe('item-context', () => {
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

    describe('when applied to a component', () => {
      let mockComponent: TestElement;
      let parentElement: HTMLElement;

      const setupElement = (options?: Parameters<typeof ItemContext>[0]) => {
        mockComponent = new TestElement();

        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(mockComponent, 'remove').mockImplementation(() => {});

        const decorator = ItemContext(options);
        decorator(mockComponent as never, 'product');

        parentElement.appendChild(mockComponent);

        return mockComponent;
      };

      const teardown = () => {
        if (parentElement) {
          document.body.removeChild(parentElement);
          parentElement = null as never;
        }
        mockComponent = null as never;
        vi.clearAllMocks();
      };

      beforeEach(async () => {
        teardown();
        parentElement = document.createElement('parent-element');

        document.body.appendChild(parentElement);
      });

      describe('#connectedCallback', () => {
        it('should wrap the #connectedCallback method', () => {
          setupElement();

          expect(mockComponent.connectedCallback).not.toBe(
            originalConnectedCallback
          );
          expect(typeof mockComponent.connectedCallback).toBe('function');
        });

        it('should dispatch the resolveResult event in #connectedCallback', () => {
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

        it('when event is not canceled, should call original #connectedCallback', () => {
          setupElement();
          vi.spyOn(mockComponent, 'dispatchEvent').mockReturnValue(false);

          mockComponent.connectedCallback?.();

          expect(originalConnectedCallback).toHaveBeenCalled();
        });

        it('when event is canceled in #connectedCallback, should set error', () => {
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
      });

      describe('#updated', () => {
        it('should wrap the #updated method', () => {
          setupElement();

          expect(mockComponent.updated).not.toBe(originalUpdated);
          expect(typeof mockComponent.updated).toBe('function');
        });
        it('when no error, should call original #updated', () => {
          setupElement();
          const args = ['arg1', 'arg2'];

          mockComponent.updated?.(...args);

          expect(originalUpdated).toHaveBeenCalledWith(...args);
        });

        it('when error exists, should not call original #updated', () => {
          setupElement();
          mockComponent.error = new Error('Test error');

          mockComponent.updated?.('arg1', 'arg2');

          expect(originalUpdated).not.toHaveBeenCalled();
        });
      });

      describe('#render', () => {
        it('should wrap the #render method', () => {
          setupElement();

          expect(mockComponent.render).not.toBe(originalRender);
          expect(typeof mockComponent.render).toBe('function');
        });

        it('when no error, should call original #render', () => {
          setupElement();

          const result = mockComponent.render?.();

          expect(originalRender).toHaveBeenCalled();
          expect(result).toBe('<div>rendered</div>');
        });

        it('when error exists, should remove element and log error in #render', () => {
          setupElement();
          mockComponent.error = new Error('Test error');

          mockComponent.render?.();

          expect(mockComponent.remove).toHaveBeenCalled();
          expect(console.error).toHaveBeenCalledWith(
            'Result component is in error and has been removed from the DOM',
            mockComponent.error,
            mockComponent
          );
          expect(originalRender).not.toHaveBeenCalled();
        });
      });
    });
  });
});
