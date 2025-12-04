import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type DisplayConfig,
  ItemDisplayConfigContextController,
} from './item-display-config-context-controller';

@customElement('test-element')
class TestElement extends LitElement {
  controller!: ItemDisplayConfigContextController;

  connectedCallback() {
    super.connectedCallback();
    this.controller = new ItemDisplayConfigContextController(this);
  }

  render() {
    return '<div>rendered</div>';
  }
}

describe('item-display-config-context', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#ItemDisplayConfigContextController', () => {
    let element: TestElement;
    let parentElement: HTMLElement;

    const teardown = () => {
      if (parentElement?.parentNode) {
        document.body.removeChild(parentElement);
      }
      parentElement = null as never;
      element = null as never;
      vi.clearAllMocks();
    };

    beforeEach(async () => {
      teardown();
      parentElement = document.createElement('parent-element');
      document.body.appendChild(parentElement);

      element = new TestElement();
      parentElement.appendChild(element);

      await element.updateComplete;
    });

    afterEach(() => {
      teardown();
    });

    it('should create a controller instance when element is connected', () => {
      expect(element.controller).toBeInstanceOf(
        ItemDisplayConfigContextController
      );
    });

    it('should initially have null config', () => {
      expect(element.controller.config).toBeNull();
    });

    describe('when #hostConnected is called', () => {
      it('should dispatch the resolveResultDisplayConfig event', () => {
        const dispatchEventSpy = vi
          .spyOn(element, 'dispatchEvent')
          .mockReturnValue(false);

        element.controller.hostConnected();

        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'atomic/resolveResultDisplayConfig',
          })
        );
      });

      it('should set config to null when event is cancelled', () => {
        vi.spyOn(element, 'dispatchEvent').mockReturnValue(true);

        element.controller.hostConnected();

        expect(element.controller.config).toBeNull();
      });

      it('should set config when event handler provides config', () => {
        const mockConfig: DisplayConfig = {
          density: 'comfortable',
          imageSize: 'large',
        };

        vi.spyOn(element, 'dispatchEvent').mockImplementation((event) => {
          const customEvent = event as CustomEvent;
          if (customEvent.detail) {
            customEvent.detail(mockConfig);
          }
          return false;
        });

        element.controller.hostConnected();

        expect(element.controller.config).toEqual(mockConfig);
      });
    });
  });
});
