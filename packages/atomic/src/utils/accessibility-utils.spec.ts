import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi,
} from 'vitest';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import type {CommerceBindings} from '../components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {
  AriaLiveRegionController,
  FocusTargetController,
} from './accessibility-utils';
import {defer} from './utils';

vi.mock('./utils', () => ({
  defer: vi.fn(async () => {
    return Promise.resolve();
  }),
}));

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

@customElement('focus-target-controller-test-component')
@bindings()
class FocusTargetControllerTestComponent
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  private _focusTargetController!: FocusTargetController;

  constructor() {
    super();
  }

  public initialize() {}

  public get focusTargetController() {
    if (!this._focusTargetController) {
      this._focusTargetController = new FocusTargetController(
        this,
        this.bindings
      );
    }
    return this._focusTargetController;
  }
}

describe('accessibility-utils', () => {
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

  describe('FocusTargetController', () => {
    const renderComponent = async (getUniqueIDFromEngine?: Mock) => {
      const {element} =
        await renderInAtomicCommerceInterface<FocusTargetControllerTestComponent>(
          {
            template: html`<focus-target-controller-test-component></focus-target-controller-test-component>`,
            selector: 'focus-target-controller-test-component',
            bindings: (bindings) => {
              bindings.store.getUniqueIDFromEngine =
                getUniqueIDFromEngine ?? vi.fn();
              return bindings;
            },
          }
        );

      return element;
    };

    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('#constructor', () => {
      it('should create an instance', async () => {
        const {focusTargetController} = await renderComponent();

        expect(focusTargetController).toBeInstanceOf(FocusTargetController);
      });
    });

    describe('#setTarget', () => {
      let focusTargetController: FocusTargetController;

      beforeEach(async () => {
        focusTargetController = (await renderComponent()).focusTargetController;
      });

      describe('when called with undefined', () => {
        it('should not focus on any element on the next call to the #focus method', async () => {
          const htmlElementFocusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

          await focusTargetController.setTarget(undefined);
          await focusTargetController.focus();

          expect(htmlElementFocusSpy).not.toHaveBeenCalled();
        });

        describe('when doing focus on the next target', () => {
          let focusMethodSpy: MockInstance;

          beforeEach(async () => {
            focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

            focusTargetController.focusOnNextTarget();
            await vi.runAllTimersAsync();
            await focusTargetController.setTarget(undefined);
          });

          it('should not call the #focus method', async () => {
            expect(focusMethodSpy).not.toHaveBeenCalled();
          });

          it('should not prevent the immediate next call with an element from calling the #focus method', async () => {
            await focusTargetController.setTarget(
              document.createElement('div')
            );
            await focusTargetController.setTarget(
              document.createElement('span')
            );

            expect(focusMethodSpy).toHaveBeenCalledOnce();
          });
        });
      });

      describe('when called with an element', () => {
        it('should focus on the element on the next direct call to the #focus method', async () => {
          const element = document.createElement('div');
          const elementFocusSpy = vi.spyOn(element, 'focus');

          await focusTargetController.setTarget(element);

          expect(elementFocusSpy).not.toHaveBeenCalled();

          await focusTargetController.focus();

          expect(elementFocusSpy).toHaveBeenCalledOnce();
        });

        it('should not call the #focus method when not doing focus on the next target', async () => {
          const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

          await focusTargetController.setTarget(document.createElement('div'));

          expect(focusMethodSpy).not.toHaveBeenCalled();
        });

        it('should call the #focus method when doing focus on the next target', async () => {
          const focusMethodSpy = vi.spyOn(focusTargetController, 'focus');

          focusTargetController.focusOnNextTarget();
          await vi.runAllTimersAsync();

          expect(focusMethodSpy).not.toHaveBeenCalled();

          await focusTargetController.setTarget(document.createElement('div'));

          expect(focusMethodSpy).toHaveBeenCalledOnce();
        });
      });
    });

    describe('#focus', async () => {
      it('should call the #defer util function', async () => {
        const mockedDefer = vi.mocked(defer);

        const {focusTargetController} = await renderComponent();

        expect(mockedDefer).not.toHaveBeenCalled();

        await focusTargetController.focus();

        expect(mockedDefer).toHaveBeenCalledOnce();
      });

      it('should focus on the current element', async () => {
        const {focusTargetController} = await renderComponent();

        const element = document.createElement('div');
        const elementFocusSpy = vi.spyOn(element, 'focus');

        focusTargetController.setTarget(element);

        expect(elementFocusSpy).not.toHaveBeenCalled();

        await focusTargetController.focus();

        expect(elementFocusSpy).toHaveBeenCalledOnce();
      });

      it('should call the registered focus callbacks', async () => {
        const {focusTargetController} = await renderComponent();

        const focusCallback = vi.fn();
        focusTargetController.registerFocusCallback(focusCallback);

        await focusTargetController.focus();

        expect(focusCallback).toHaveBeenCalled();
      });

      it('should clear the registered focus callbacks', async () => {
        const {focusTargetController} = await renderComponent();

        const focusCallback = vi.fn();
        focusTargetController.registerFocusCallback(focusCallback);

        await focusTargetController.focus();
        await focusTargetController.focus();

        expect(focusCallback).toHaveBeenCalledOnce();
      });

      it('should call the internal focus callback when set', async () => {
        const {focusTargetController} = await renderComponent();

        // This method return a promise that resolves when the focus is done
        const internalCallback = focusTargetController.focusOnNextTarget();

        await focusTargetController.focus();

        expect(internalCallback).resolves.toBeUndefined();
      });
    });

    describe('#focusAfterSearch', async () => {
      describe('when the component completes an update and a new search was executed', () => {
        describe('when a target element is set', () => {
          it('should cause the #defer util function to be called', async () => {
            const mockedDefer = vi.mocked(defer);

            const component = await renderComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const {focusTargetController} = component;

            focusTargetController.setTarget(document.createElement('div'));

            expect(mockedDefer).not.toHaveBeenCalled();

            component.requestUpdate();

            focusTargetController.focusAfterSearch();
            await vi.runAllTimersAsync();

            expect(mockedDefer).toHaveBeenCalledOnce();
          });

          it('should cause the target element to be focused', async () => {
            const component = await renderComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const {focusTargetController} = component;

            const element = document.createElement('div');
            const elementFocusSpy = vi.spyOn(element, 'focus');

            focusTargetController.setTarget(element);

            expect(elementFocusSpy).not.toHaveBeenCalled();

            component.requestUpdate();

            focusTargetController.focusAfterSearch();
            await vi.runAllTimersAsync();

            expect(elementFocusSpy).toHaveBeenCalledOnce();
          });
        });

        describe('when no target element is set', () => {
          it('should not cause the #defer util function to be called', async () => {
            const mockedDefer = vi.mocked(defer);

            const component = await renderComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const {focusTargetController} = component;

            component.requestUpdate();

            focusTargetController.focusAfterSearch();
            await vi.runAllTimersAsync();

            expect(mockedDefer).not.toHaveBeenCalled();
          });

          it('should not cause any element to be focused', async () => {
            const component = await renderComponent(
              vi
                .fn()
                .mockReturnValueOnce('request-id-1')
                .mockReturnValue('request-id-2')
            );

            const {focusTargetController} = component;

            const htmlElementFocusSpy = vi.spyOn(
              HTMLElement.prototype,
              'focus'
            );

            component.requestUpdate();

            focusTargetController.focusAfterSearch();
            await vi.runAllTimersAsync();

            expect(htmlElementFocusSpy).not.toHaveBeenCalled();
          });
        });
      });

      describe('when the component completes an update and no new search was executed', () => {
        it('should not cause the #defer util function to be called', async () => {
          const mockedDefer = vi.mocked(defer);

          const component = await renderComponent(
            vi.fn().mockReturnValue('request-id-1')
          );

          const {focusTargetController} = component;

          component.requestUpdate();

          focusTargetController.focusAfterSearch();
          await vi.runAllTimersAsync();

          expect(mockedDefer).not.toHaveBeenCalled();
        });

        it('should not cause any element to be focused', async () => {
          const component = await renderComponent(
            vi.fn().mockReturnValue('request-id-1')
          );

          const {focusTargetController} = component;

          const htmlElementFocusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

          focusTargetController.setTarget(document.createElement('div'));

          component.requestUpdate();

          focusTargetController.focusAfterSearch();
          await vi.runAllTimersAsync();

          expect(htmlElementFocusSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('#focusOnNextTarget', () => {
      it('should cause the next call to the #setTarget method with an element to call the #focus method', async () => {
        const {focusTargetController} = await renderComponent();
        const htmlElementFocusSpy = vi.spyOn(focusTargetController, 'focus');

        focusTargetController.focusOnNextTarget();
        await vi.runAllTimersAsync();

        focusTargetController.setTarget(document.createElement('div'));

        expect(htmlElementFocusSpy).toHaveBeenCalledOnce();
      });

      it('should not cause subsequent calls to the #setTarget method with an element to call the #focus method', async () => {
        const {focusTargetController} = await renderComponent();
        const htmlElementFocusSpy = vi.spyOn(focusTargetController, 'focus');

        focusTargetController.focusOnNextTarget();
        await vi.runAllTimersAsync();

        focusTargetController.setTarget(document.createElement('div'));
        focusTargetController.setTarget(document.createElement('span'));

        expect(htmlElementFocusSpy).toHaveBeenCalledOnce();
      });
    });

    describe('#disableForCurrentSearch', () => {
      it('should prevent the defer that handle the focus actions from being called if executed after #focusAfterSearch method', async () => {
        const mockedDefer = vi.mocked(defer);

        const getUniqueIDFromEngine = vi
          .fn()
          .mockReturnValue('request-id')
          .mockReturnValueOnce('request-id-2')
          .mockReturnValueOnce('request-id-3')
          .mockReturnValueOnce('request-id-4');

        const component = await renderComponent(getUniqueIDFromEngine);

        const {focusTargetController} = component;

        focusTargetController.setTarget(document.createElement('div'));

        focusTargetController.focusAfterSearch();
        focusTargetController.disableForCurrentSearch();
        component.requestUpdate();
        await vi.runAllTimersAsync();

        expect(mockedDefer).not.toHaveBeenCalled();
      });
    });

    describe('#hostUpdated', () => {
      describe('when the host is updated after a search & that the focus has not been disabled for the current search', () => {
        let component: FocusTargetControllerTestComponent;
        let focusTargetController: FocusTargetController;

        const setup = async ({
          mockedDefer,
          element,
        }: {
          mockedDefer?: typeof defer;
          element?: HTMLElement;
        } = {}) => {
          mockedDefer ??= vi.mocked(defer).mockReturnValue(Promise.resolve());
          element ??= document.createElement('div');
          const getUniqueIDFromEngine = vi
            .fn()
            .mockReturnValue('request-id')
            .mockReturnValueOnce('request-id-2')
            .mockReturnValueOnce('request-id-3')
            .mockReturnValueOnce('request-id-4');

          component = await renderComponent(getUniqueIDFromEngine);
          focusTargetController = component.focusTargetController;
          await focusTargetController.setTarget(element);
          focusTargetController.focusAfterSearch();
        };

        it('should call the #defer method', async () => {
          const mockedDefer = vi.mocked(defer);
          await setup({mockedDefer});

          component.requestUpdate();
          await vi.runAllTimersAsync();

          expect(mockedDefer).toHaveBeenCalledOnce();
        });

        it('should focus on the target element', async () => {
          const element = document.createElement('div');
          const elementFocusSpy = vi.spyOn(element, 'focus');

          await setup({element});

          component.requestUpdate();
          await vi.runAllTimersAsync();

          expect(elementFocusSpy).toHaveBeenCalledOnce();
        });

        it('should call the registered focus callbacks', async () => {
          await setup();

          const focusCallback = vi.fn();
          focusTargetController.registerFocusCallback(focusCallback);

          component.requestUpdate();
          await vi.runAllTimersAsync();

          expect(focusCallback).toHaveBeenCalled();
        });

        it('should clear the registered focus callbacks', async () => {
          await setup();

          const focusCallback = vi.fn();
          focusTargetController.registerFocusCallback(focusCallback);

          component.requestUpdate();
          await vi.runAllTimersAsync();
          component.requestUpdate();
          await vi.runAllTimersAsync();

          expect(focusCallback).toHaveBeenCalledOnce();
        });

        it('should call the internal focus callback when set', async () => {
          await setup();

          // This method return a promise that resolves when the focus is done
          const internalCallback = focusTargetController.focusOnNextTarget();

          component.requestUpdate();
          await vi.runAllTimersAsync();

          expect(internalCallback).resolves.toBeUndefined();
        });
      });
    });
  });
});
