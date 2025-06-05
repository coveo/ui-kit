import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {InteractiveItemContext} from './interactive-item-context';

const originalConnectedCallback = vi.fn();
const originalRender = vi.fn(() => '<div>rendered</div>');
const originalUpdated = vi.fn();

@customElement('test-element')
class TestElement extends LitElement {
  connectedCallback = originalConnectedCallback;
  render = originalRender;
  updated = originalUpdated;
}

describe('InteractiveItemContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a decorator function', () => {
    const decorator = InteractiveItemContext();

    expect(typeof decorator).toBe('function');
  });

  describe('when applied to a component', () => {
    let mockComponent: TestElement;
    let parentElement: HTMLElement;

    beforeEach(async () => {
      if (parentElement) {
        parentElement.remove();
      }
      parentElement = document.createElement('parent-element');

      document.body.appendChild(parentElement);

      mockComponent = new TestElement();

      const decorator = InteractiveItemContext();
      decorator(mockComponent as never, 'product');

      parentElement.appendChild(mockComponent);
    });

    describe('#connectedCallback', () => {
      it('should wrap the #connectedCallback method', () => {
        expect(mockComponent.connectedCallback).not.toBe(
          originalConnectedCallback
        );
        expect(typeof mockComponent.connectedCallback).toBe('function');
      });

      it('should dispatch the resolveInteractiveResult event in #connectedCallback', () => {
        const dispatchEventSpy = vi
          .spyOn(mockComponent, 'dispatchEvent')
          .mockReturnValue(false);

        mockComponent.connectedCallback?.();

        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'atomic/resolveInteractiveResult',
          })
        );
      });

      it('should call original #connectedCallback after dispatching event', () => {
        vi.spyOn(mockComponent, 'dispatchEvent').mockReturnValue(false);

        mockComponent.connectedCallback?.();

        expect(originalConnectedCallback).toHaveBeenCalled();
      });
    });
  });
});
