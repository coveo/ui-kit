import {Schema, StringValue} from '@coveo/bueno';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {errorGuard} from '@/src/decorators/error-guard';
import {ItemContextController, MissingParentError} from './item-context-controller';

@customElement('test-element')
class TestElement extends LitElement {
  @state() error?: Error;

  requestUpdate = vi.fn();
}

@customElement('test-validated-item-element')
class TestValidatedItemElement extends LitElement {
  @state() error?: Error;
  @property() name = 'invalid';
  private itemContext = new ItemContextController<{title: string}>(this);

  constructor() {
    super();
    new ValidatePropsController(
      this,
      () => ({name: this.name}),
      new Schema({name: new StringValue({constrainTo: ['valid']})})
    );
  }

  @errorGuard()
  render() {
    return html`<p>${this.itemContext.item?.title}</p>`;
  }
}

describe('item-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('#MissingParentError', () => {
    it('should create error with correct message when provided element and parent names', () => {
      const error = new MissingParentError('child-element', 'parent-element');

      expect(error.message).toBe(
        'The "child-element" element must be the child of an "parent-element" element.'
      );
    });
  });

  describe('#ItemContextController', () => {
    let mockElement: TestElement;
    let controller: ItemContextController;

    beforeEach(() => {
      mockElement = new TestElement();
      vi.spyOn(mockElement, 'addController');
      vi.spyOn(mockElement, 'dispatchEvent');
    });

    it('should accept default options', () => {
      controller = new ItemContextController(mockElement);

      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    it('should accept custom options', () => {
      const customOptions = {
        parentName: 'custom-parent',
        folded: true,
      };
      controller = new ItemContextController(mockElement, customOptions);

      expect(mockElement.addController).toHaveBeenCalledWith(controller);
    });

    describe('when controller is connected', () => {
      beforeEach(() => {
        controller = new ItemContextController(mockElement, {
          parentName: 'custom-parent',
          folded: false,
        });
      });

      it('should dispatch the resolveResult event in #hostConnected', () => {
        vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(false);

        controller.hostConnected();

        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'atomic/resolveResult',
          })
        );
      });

      describe('when event is not canceled', () => {
        beforeEach(() => {
          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            // Simulate successful event handling by calling the detail function
            const customEvent = event as CustomEvent;
            const handler = customEvent.detail;
            if (typeof handler === 'function') {
              handler({
                result: {title: 'Test Item'},
                children: [],
              });
            }
            return false;
          });
        });

        it('should set item data and clear error', () => {
          controller.hostConnected();

          expect(controller.item).toEqual({title: 'Test Item'});
          expect(controller.error).toBeNull();
          expect(controller.hasError).toBe(false);
          expect(mockElement.error).toBeUndefined();
          expect(mockElement.requestUpdate).toHaveBeenCalled();
        });

        it('should keep an error set by another writer', () => {
          const foreignError = new Error('foreign');
          mockElement.error = foreignError;

          controller.hostConnected();

          expect(mockElement.error).toBe(foreignError);
        });

        it('should extract folded data when #folded is true', () => {
          controller = new ItemContextController(mockElement, {
            parentName: 'custom-parent',
            folded: true,
          });

          controller.hostConnected();

          expect(controller.item).toEqual({
            result: {title: 'Test Item'},
            children: [],
          });
        });

        it('should handle item without children when #folded is true', () => {
          controller = new ItemContextController(mockElement, {
            parentName: 'custom-parent',
            folded: true,
          });

          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            const customEvent = event as CustomEvent;
            const handler = customEvent.detail;
            if (typeof handler === 'function') {
              handler({title: 'Test Item'});
            }
            return false;
          });

          controller.hostConnected();

          expect(controller.item).toEqual({
            children: [],
            result: {title: 'Test Item'},
          });
        });
      });

      describe('when event is canceled', () => {
        beforeEach(() => {
          vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(true);
          Object.defineProperty(mockElement, 'nodeName', {
            value: 'TEST-ELEMENT',
            configurable: true,
          });
        });

        it('should set error and clear item data', () => {
          controller.hostConnected();

          expect(controller.item).toBeNull();
          expect(controller.error).toBeInstanceOf(MissingParentError);
          expect(controller.hasError).toBe(true);
          expect(controller.error?.message).toBe(
            'The "test-element" element must be the child of an "custom-parent" element.'
          );
          expect(mockElement.error).toBe(controller.error);
          expect(mockElement.requestUpdate).toHaveBeenCalled();
        });

        it('should restore an error set by another writer once the item resolves', () => {
          const foreignError = new Error('foreign');
          mockElement.error = foreignError;
          controller.hostConnected();
          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            (event as CustomEvent).detail({title: 'Test Item'});
            return false;
          });

          controller.hostConnected();

          expect(mockElement.error).toBe(foreignError);
        });

        it('should clear its own error once the item resolves', () => {
          controller.hostConnected();
          vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
            (event as CustomEvent).detail({title: 'Test Item'});
            return false;
          });

          controller.hostConnected();

          expect(mockElement.error).toBeUndefined();
          expect(controller.hasError).toBe(false);
        });
      });
    });

    describe('#item getter', () => {
      beforeEach(() => {
        controller = new ItemContextController(mockElement);
      });

      it('should return null when there is an error', () => {
        vi.spyOn(mockElement, 'dispatchEvent').mockReturnValue(true);
        Object.defineProperty(mockElement, 'nodeName', {
          value: 'TEST-ELEMENT',
          configurable: true,
        });

        controller.hostConnected();

        expect(controller.item).toBeNull();
      });

      it('should return item data when there is no error', () => {
        vi.spyOn(mockElement, 'dispatchEvent').mockImplementation((event) => {
          const customEvent = event as CustomEvent;
          const handler = customEvent.detail;
          if (typeof handler === 'function') {
            handler({title: 'Test Item'});
          }
          return false;
        });

        controller.hostConnected();

        expect(controller.item).toEqual({title: 'Test Item'});
      });
    });
  });

  it('should show its missing-parent error once another writer clears its error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const parent = document.createElement('div');
    parent.addEventListener('atomic/resolveResult', (event) => {
      event.preventDefault();
      (event as CustomEvent).detail({title: 'Test Item'});
    });
    document.body.appendChild(parent);
    const element = new TestValidatedItemElement();
    parent.appendChild(element);
    await element.updateComplete;

    document.body.appendChild(element);
    await element.updateComplete;
    element.name = 'valid';
    await element.updateComplete;
    await element.updateComplete;

    expect(element.error).toBeInstanceOf(MissingParentError);
    expect(element.shadowRoot?.querySelector('atomic-component-error')).not.toBeNull();
    expect(element.shadowRoot?.querySelector('p')).toBeNull();

    parent.appendChild(element);
    await element.updateComplete;

    expect(element.error).toBeUndefined();
    expect(element.shadowRoot?.querySelector('p')?.textContent).toBe('Test Item');
    element.remove();
    parent.remove();
  });
});
