import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import {ChildTemplatesContextController} from './child-templates-context-controller';

const mockResultTemplateProvider: ResultTemplateProvider = {
  getTemplateContent: vi.fn(),
  getLinkTemplateContent: vi.fn(),
} as unknown as ResultTemplateProvider;

@customElement('test-element')
class TestElement extends LitElement {
  @state() error!: Error;
  requestUpdate = vi.fn();
}

describe('#ChildTemplatesContextController', () => {
  let mockElement: TestElement;
  let controller: ChildTemplatesContextController;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockElement = new TestElement();
    vi.spyOn(mockElement, 'addController');
    vi.spyOn(mockElement, 'requestUpdate');
    vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(false);

    controller = new ChildTemplatesContextController(mockElement);
  });

  it('should register itself as a controller with the host', () => {
    expect(mockElement.addController).toHaveBeenCalledWith(controller);
  });

  describe('#itemTemplateProvider', () => {
    it('should return null initially', () => {
      expect(controller.itemTemplateProvider).toBeNull();
    });

    it('should return the template provider after it has been set', () => {
      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(mockResultTemplateProvider);

      expect(controller.itemTemplateProvider).toBe(mockResultTemplateProvider);
    });
  });

  describe('#hostConnected', () => {
    it('should dispatch the resolveChildTemplates event', () => {
      controller.hostConnected();

      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/resolveChildTemplates',
        })
      );
    });

    it('should update the template provider when event callback is invoked', () => {
      controller.hostConnected();

      const dispatchCall = vi.mocked(mockElement.dispatchEvent).mock.calls[0];
      const event = dispatchCall[0] as CustomEvent;
      event.detail(mockResultTemplateProvider);

      expect(controller.itemTemplateProvider).toBe(mockResultTemplateProvider);
      expect(mockElement.requestUpdate).toHaveBeenCalled();
    });

    it('should set template provider to null when event is canceled', () => {
      vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(true);

      controller.hostConnected();

      expect(controller.itemTemplateProvider).toBeNull();
      expect(mockElement.requestUpdate).toHaveBeenCalled();
    });
  });
});
