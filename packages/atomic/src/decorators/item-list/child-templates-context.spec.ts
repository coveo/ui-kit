import {ItemTemplateProvider} from '@/src/components/common/item-list/item-template-provider';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {childTemplatesContext} from './child-templates-context';

const originalConnectedCallback = vi.fn();
const originalRender = vi.fn(() => '<div>rendered</div>');
const originalUpdated = vi.fn();

const mockItemTemplateProvider = {
  getTemplateContent: vi.fn(),
  getLinkTemplateContent: vi.fn(),
};

@customElement('test-element')
class TestElement extends LitElement {
  connectedCallback = originalConnectedCallback;
  render = originalRender;
  updated = originalUpdated;

  @state() error!: Error;
  itemTemplateProvider?: Partial<ItemTemplateProvider>;
}

describe('child-templates-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#ChildTemplatesContext', () => {
    it('should return a decorator function', () => {
      const decorator = childTemplatesContext();

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

        const decorator = childTemplatesContext();
        decorator(mockComponent as never, 'itemTemplateProvider');

        parentElement.appendChild(mockComponent);
      });

      describe('#updated', () => {
        it('should wrap the #updated method', () => {
          expect(mockComponent.updated).not.toBe(originalUpdated);
          expect(typeof mockComponent.updated).toBe('function');
        });

        it('should dispatch the resolveChildTemplates event', () => {
          const dispatchEventSpy = vi
            .spyOn(mockComponent, 'dispatchEvent')
            .mockReturnValue(false);

          mockComponent.updated?.();

          expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'atomic/resolveChildTemplates',
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
              type: 'atomic/resolveChildTemplates',
            })
          );
          expect(originalUpdated).not.toHaveBeenCalled();
        });

        it('when not cancelled, should set the #itemTemplateProvider prop', () => {
          vi.spyOn(mockComponent, 'dispatchEvent').mockImplementation(
            (event) => {
              (event as CustomEvent).detail(mockItemTemplateProvider);
              return false;
            }
          );

          mockComponent.updated?.();

          expect(mockComponent.itemTemplateProvider).toBe(
            mockItemTemplateProvider
          );
          expect(originalUpdated).toHaveBeenCalled();
        });

        it('when cancelled, should set the #itemTemplateProvider prop to null', () => {
          mockComponent.itemTemplateProvider = mockItemTemplateProvider;

          vi.spyOn(mockComponent, 'dispatchEvent').mockReturnValue(true);

          mockComponent.updated?.();

          expect(mockComponent.itemTemplateProvider).toBeNull();
          expect(originalUpdated).not.toHaveBeenCalled();
        });
      });
    });
  });
});
