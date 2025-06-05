import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {
  ItemDisplayConfigContext,
  DisplayConfig,
} from './item-display-config-context';

const originalConnectedCallback = vi.fn();
const originalRender = vi.fn(() => '<div>rendered</div>');
const originalUpdated = vi.fn();

@customElement('test-element')
class TestElement extends LitElement {
  connectedCallback = originalConnectedCallback;
  render = originalRender;
  updated = originalUpdated;

  @state() error!: Error;
  displayConfig!: DisplayConfig;
}

describe('item-display-config-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#ItemDisplayConfigContext', () => {
    it('should return a decorator function', () => {
      const decorator = ItemDisplayConfigContext();

      expect(typeof decorator).toBe('function');
    });

    describe('when applied to a component', () => {
      let mockComponent: TestElement;
      let parentElement: HTMLElement;

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

        mockComponent = new TestElement();

        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(mockComponent, 'remove').mockImplementation(() => {});

        const decorator = ItemDisplayConfigContext();
        decorator(mockComponent as never, 'displayConfig');

        parentElement.appendChild(mockComponent);
      });

      describe('#updated', () => {
        it('should wrap the #updated method', () => {
          expect(mockComponent.updated).not.toBe(originalUpdated);
          expect(typeof mockComponent.updated).toBe('function');
        });

        it('should dispatch the resolveResultDisplayConfig event', () => {
          const dispatchEventSpy = vi
            .spyOn(mockComponent, 'dispatchEvent')
            .mockReturnValue(false);

          mockComponent.updated?.();

          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'atomic/resolveResultDisplayConfig',
            })
          );
        });

        it('when cancelled, should not call the original updated method', () => {
          const dispatchEventSpy = vi
            .spyOn(mockComponent, 'dispatchEvent')
            .mockReturnValue(true);

          mockComponent.updated?.();

          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'atomic/resolveResultDisplayConfig',
            })
          );
          expect(originalUpdated).not.toHaveBeenCalled();
        });

        it('when the event handler is called, should set the item variable ', () => {
          const mockConfig: DisplayConfig = {
            density: 'comfortable',
            imageSize: 'large',
          };

          const dispatchEventSpy = vi
            .spyOn(mockComponent, 'dispatchEvent')
            .mockImplementation((event) => {
              const customEvent = event as CustomEvent;
              if (customEvent.detail) {
                customEvent.detail(mockConfig);
              }
              return false;
            });

          mockComponent.updated?.();

          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'atomic/resolveResultDisplayConfig',
            })
          );
          expect(mockComponent.displayConfig).toEqual(mockConfig);
        });
      });
    });
  });
});
