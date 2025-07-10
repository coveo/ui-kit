import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnyItem} from '@/src/components/common/interface/item.js';
import type {LitElementWithError} from '@/src/decorators/types.js';
import {InteractiveItemContextController} from './interactive-item-context-controller';

@customElement('test-element')
class TestElement extends LitElement implements LitElementWithError {
  @state() error!: Error;
  requestUpdate = vi.fn();
}

describe('#InteractiveItemContextController', () => {
  let mockElement: TestElement;
  let controller: InteractiveItemContextController;

  beforeEach(() => {
    mockElement = new TestElement();
    vi.spyOn(mockElement, 'addController');
    vi.spyOn(mockElement, 'requestUpdate');
    vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(false);

    controller = new InteractiveItemContextController(mockElement);
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledWith(controller);
  });

  describe('#interactiveItem', () => {
    it('should return null initially', () => {
      expect(controller.interactiveItem).toBeNull();
    });

    it('should return the interactive item after it has been set', () => {
      const mockItem: AnyItem = {title: 'test-item'} as AnyItem;

      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(mockItem);

      expect(controller.interactiveItem).toBe(mockItem);
    });
  });

  describe('#hostConnected', () => {
    it('should dispatch the resolveInteractiveResult event', () => {
      controller.hostConnected();

      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/resolveInteractiveResult',
        })
      );
    });

    it('should update the interactive item when event callback is invoked', () => {
      const mockItem: AnyItem = {title: 'test-item'} as AnyItem;

      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(mockItem);

      expect(controller.interactiveItem).toBe(mockItem);
      expect(mockElement.requestUpdate).toHaveBeenCalled();
    });
  });
});
