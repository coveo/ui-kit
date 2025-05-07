import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, Mock, vi} from 'vitest';
import {CommerceBindings} from '../components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {bindings} from '../decorators/bindings';
import {InitializableComponent} from '../decorators/types';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from './accessibility-utils';
import {defer} from './stencil-utils';

vi.mock('../utils/stencil-utils');

@customElement('stub-aria-live')
class StubAriaLive extends LitElement {
  @state() regions: {
    [region: string]: {assertive: boolean; message: string};
  } = {};

  registerRegion = vi.fn();
  updateMessage = vi.fn();
  findAriaLiveListenerSpy = vi.fn().mockImplementation((event) => {
    event.detail.element = this;
  });

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      'atomic/accessibility/findAriaLive',
      this.findAriaLiveListenerSpy
    );
  }
}

@customElement('test-element')
class TestElement extends LitElement {
  region = new AriaLiveRegionController(this, 'test-region', true);

  render() {
    this.region.message = 'Test message';

    return html`<div>A test element</div>`;
  }
}

describe('AriaLiveRegionController', () => {
  let testElement: TestElement;
  let ariaLive: StubAriaLive;

  beforeEach(async () => {
    await fixture(
      html`<stub-aria-live></stub-aria-live> <test-element></test-element>`
    );
    testElement = document.querySelector('test-element')! as TestElement;
    ariaLive = document.querySelector('stub-aria-live')! as StubAriaLive;
  });

  it('should register the region when the host is updated', async () => {
    expect(ariaLive.registerRegion).toHaveBeenCalledWith('test-region', true);
  });

  it('should dispatch a message to the aria live when setting the message', async () => {
    expect(ariaLive.updateMessage).toHaveBeenCalledWith(
      'test-region',
      'Test message',
      true
    );
  });

  it('should update the message when the message is changed', async () => {
    testElement.region.message = 'New message';
    expect(ariaLive.updateMessage).toHaveBeenCalledWith(
      'test-region',
      'New message',
      true
    );
  });
});

@customElement('test-component')
@bindings()
export class TestComponent
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  private _focusTargetController!: FocusTargetController;

  constructor() {
    super();
  }

  public get focusTargetController() {
    if (!this._focusTargetController) {
      this._focusTargetController = new FocusTargetController(this);
    }
    return this._focusTargetController;
  }
}

describe('FocusTargetController', () => {
  const renderTestComponent = async (getUniqueIDFromEngine?: Mock) => {
    const {element} = await renderInAtomicCommerceInterface<TestComponent>({
      template: html`<test-component></test-component>`,
      selector: 'test-component',
      bindings: (bindings) => {
        bindings.store.getUniqueIDFromEngine = getUniqueIDFromEngine ?? vi.fn();
        return bindings;
      },
    });

    return element;
  };

  describe('#constructor', () => {
    it('should set the bindings', async () => {
      const getUniqueIDFromEngine = vi.fn();

      const {focusTargetController} = await renderTestComponent(
        getUniqueIDFromEngine
      );

      focusTargetController.focusAfterSearch();

      expect(getUniqueIDFromEngine).toHaveBeenCalled();
    });

    // TODO: test handleComponentRenderLoop logic...
  });

  describe('#setTarget', () => {
    let focusTargetController: FocusTargetController;

    beforeEach(async () => {
      focusTargetController = (await renderTestComponent())
        .focusTargetController;
    });

    describe('when called with undefined', () => {
      it('should not focus on any element on the next call to the #focus method', async () => {
        const htmlElementFocusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

        focusTargetController.setTarget(undefined);
        await focusTargetController.focus();

        expect(htmlElementFocusSpy).not.toHaveBeenCalled();
      });

      describe('when doing focus on the next target', () => {
        it('should not call the #focus method', () => {
          const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

          focusTargetController.focusOnNextTarget();
          focusTargetController.setTarget(undefined);

          expect(focusMethodSpy).not.toHaveBeenCalled();
        });

        it('should not prevent the next call with an element from calling the #focus method', () => {
          const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

          focusTargetController.focusOnNextTarget();
          focusTargetController.setTarget(undefined);

          expect(focusMethodSpy).not.toHaveBeenCalled();

          focusTargetController.setTarget(document.createElement('div'));

          expect(focusMethodSpy).toHaveBeenCalled();
        });
      });
    });

    describe('when called with an element', () => {
      it('should focus on the element on the next direct call to the #focus method', async () => {
        const element = document.createElement('div');
        const elementFocusSpy = vi.spyOn(element, 'focus');

        focusTargetController.setTarget(element);
        await focusTargetController.focus();

        expect(elementFocusSpy).toHaveBeenCalled();
      });

      it('should not call the #focus method when not doing focus on the next target', () => {
        const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

        focusTargetController.setTarget(document.createElement('div'));

        expect(focusMethodSpy).not.toHaveBeenCalled();
      });

      it('should call the #focus method when doing focus on the next target', () => {
        const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

        focusTargetController.focusOnNextTarget();

        focusTargetController.setTarget(document.createElement('div'));

        expect(focusMethodSpy).toHaveBeenCalled();
      });
    });
  });

  describe('#focus', async () => {
    it('should call the #defer util function', async () => {
      const mockedDefer = vi.mocked(defer);

      const {focusTargetController} = await renderTestComponent();

      await focusTargetController.focus();

      expect(mockedDefer).toHaveBeenCalled();
    });

    it('should focus on the current element', async () => {
      const {focusTargetController} = await renderTestComponent();
      const element = document.createElement('div');
      const elementFocusSpy = vi.spyOn(element, 'focus');

      focusTargetController.setTarget(element);
      await focusTargetController.focus();

      expect(elementFocusSpy).toHaveBeenCalled();
    });

    // TODO: test that it calls the current #this.onFocusCallback
  });

  // TODO: fix and un-skip
  describe.skip('#focusAfterSearch', async () => {
    describe('when the component completes an update', () => {
      describe('when a new search was executed', () => {
        describe('when a target element was set', () => {
          it('should cause the #defer util function to be called', async () => {
            const mockedDefer = vi.mocked(defer);

            const testComponent = await renderTestComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            testComponent.focusTargetController.setTarget(
              document.createElement('div')
            );

            expect(mockedDefer).not.toHaveBeenCalled();

            await testComponent.focusTargetController.focusAfterSearch();

            expect(mockedDefer).toHaveBeenCalledOnce();
          });

          it('should cause the target element to be focused', async () => {
            const testComponent = await renderTestComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const element = document.createElement('div');
            const elementFocusSpy = vi.spyOn(element, 'focus');

            testComponent.focusTargetController.setTarget(element);

            expect(elementFocusSpy).not.toHaveBeenCalled();

            await testComponent.focusTargetController.focusAfterSearch();

            expect(elementFocusSpy).toHaveBeenCalledOnce();
          });
          // TODO: test that it should cause #onFocusCallback to be called
        });
        describe('when no target element was set', () => {
          it('should not call the #defer util function', async () => {
            const mockedDefer = vi.mocked(defer);

            const testComponent = await renderTestComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            await testComponent.focusTargetController.focusAfterSearch();

            expect(mockedDefer).not.toHaveBeenCalled();
          });

          it('should not focus on the target element', async () => {
            const testComponent = await renderTestComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const element = document.createElement('div');
            const elementFocusSpy = vi.spyOn(element, 'focus');

            testComponent.focusTargetController.setTarget(element);

            await testComponent.focusTargetController.focusAfterSearch();

            expect(elementFocusSpy).not.toHaveBeenCalled();
          });
          // TODO test that it doesn't call the #onFocusCallback
        });
      });
      describe('when no new search was executed', () => {
        it('should not call the #defer util function', () => {});
        it('should not focus on the target element', () => {});
        // TODO test that it doesn't call the #onFocusCallback
      });
    });

    const getUniqueIDFromEngine = vi.fn().mockReturnValueOnce('123');
    getUniqueIDFromEngine.mockReturnValue('456');

    const element = await renderTestComponent(getUniqueIDFromEngine);

    element.focusTargetController.focusAfterSearch();

    await element.updateComplete;
  });

  describe('#focusOnNextTarget', () => {});

  describe('#disableForCurrentSearch', () => {});
});
