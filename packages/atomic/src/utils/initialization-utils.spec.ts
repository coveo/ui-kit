import {buildSearchBox, buildSearchEngine, Controller} from '@coveo/headless';
import {newSpecPage, SpecPage} from '@stencil/core/testing';
import i18next from 'i18next';
import {AtomicSearchBox} from '../components/search/atomic-search-box/atomic-search-box';
import {
  AtomicSearchInterface,
  Bindings,
} from '../components/search/atomic-search-interface/atomic-search-interface';
import {createAtomicStore} from '../components/search/atomic-search-interface/store';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
  initializeBindings,
  MissingInterfaceParentError,
} from './initialization-utils';

jest.mock('./replace-breakpoint.ts', () => ({
  ...jest.requireActual('./replace-breakpoint.ts'),
  updateBreakpoints: () => {},
}));

// https://github.com/ionic-team/stencil/issues/3260
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).DocumentFragment = class DocumentFragment extends Node {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ShadowRoot = class ShadowRoot extends DocumentFragment {};

describe('InitializeBindings decorator', () => {
  it(`when using the decorator with a property other than bindings
  should log an error`, () => {
    console.error = jest.fn();
    const component: InitializableComponent<Bindings> = new AtomicSearchBox();
    InitializeBindings()(component, 'anything');

    expect(console.error).toHaveBeenCalledWith(
      'The InitializeBindings decorator should be used on a property called "bindings", and not "anything"',
      component
    );
  });

  describe('componentWillLoad method override', () => {
    let page: SpecPage;

    function getErrorComponent() {
      return page.body
        .querySelector('atomic-search-box')!
        .shadowRoot!.querySelector('atomic-component-error');
    }

    it(`when the child-component component is not the child of an atomic-search-interface component
    should set an error`, async () => {
      page = await newSpecPage({
        components: [AtomicSearchBox],
        html: '<atomic-search-box></atomic-search-box>',
      });

      expect(getErrorComponent()).toBeTruthy();
    });

    it(`when child component is loaded
    should dispatch an "atomic/initializeComponent" custom event with the initialize method as detail`, async () => {
      page = await newSpecPage({
        components: [AtomicSearchBox, AtomicSearchInterface],
        html: '<atomic-search-interface></atomic-search-interface>',
      });
      let eventContent!: CustomEvent;
      const spy = jest
        .fn()
        .mockImplementation((event) => (eventContent = event));
      page.root!.addEventListener('atomic/initializeComponent', spy);
      page.root!.innerHTML = '<atomic-search-box></atomic-search-box>';
      await page.waitForChanges();

      expect(spy).toHaveBeenCalled();
      expect(typeof eventContent.detail).toBe('function');
    });
  });

  describe('render method override', () => {
    let component: InitializableComponent<Bindings>;

    beforeEach(() => {
      component = new AtomicSearchBox();
    });

    it(`when "error" is defined
    should render an atomic-component-error component`, () => {
      InitializeBindings()(component, 'bindings');
      component.error = new Error('oups');

      expect(component.render!()).toMatchObject({
        $tag$: 'atomic-component-error',
      });
    });

    it(`when "engine" is not defined
    should render an element with the atomic-hidden class `, () => {
      InitializeBindings()(component, 'bindings');
      expect(component.render!()).toMatchObject({
        $attrs$: {class: 'atomic-hidden'},
      });
    });

    it(`when "engine" is defined
    should render the content `, () => {
      component['bindings'] = {
        engine: buildSearchEngine({
          configuration: {
            accessToken: 'accessToken',
            organizationId: 'organizationId',
          },
        }),
        i18n: i18next,
        store: createAtomicStore(),
        interfaceElement: document.createElement('atomic-search-interface'),
        createScriptElement: jest.fn(),
        createStyleElement: jest.fn(),
      };
      InitializeBindings()(component, 'bindings');
      component.initialize!();

      expect(component.render!()).toBeTruthy();
    });
  });
});

describe('BindStateToController decorator', () => {
  let component: InitializableComponent<Bindings>;

  beforeEach(() => {
    console.error = jest.fn();
    component = {
      bindings: {
        engine: buildSearchEngine({
          configuration: {
            accessToken: 'accessToken',
            organizationId: 'organizationId',
          },
        }),
        i18n: i18next,
        store: createAtomicStore(),
        interfaceElement: document.createElement('atomic-search-interface'),
        createScriptElement: jest.fn(),
        createStyleElement: jest.fn(),
      },
      error: {} as Error,
    };
  });

  it(`when the "initialize" method is not defined
  it should log a error to the console`, () => {
    BindStateToController('controller')(component, 'controllerState');
    component.initialize!();

    expect(console.error).toHaveBeenCalledWith(
      'ControllerState: The "initialize" method has to be defined and instantiate a controller for the property controller',
      component
    );
  });

  describe('when controller is initialized', () => {
    let controller: Controller;
    beforeEach(() => {
      controller = buildSearchBox(component.bindings.engine);
      component.initialize = () => {
        component.controller = controller;
      };
    });

    it(`when the "initialize" method and the "controller" property are defined
    it should not log an error to the console`, () => {
      BindStateToController('controller')(component, 'controllerState');
      component.initialize!();

      expect(console.error).not.toHaveBeenCalled();
    });

    it(`when the onUpdateCallbackMethod option defined a non-existent method
    it should log an error to the console`, () => {
      BindStateToController('controller', {onUpdateCallbackMethod: 'onUpdate'})(
        component,
        'controllerState'
      );
      component.initialize!();

      expect(console.error).toHaveBeenCalledWith(
        'ControllerState: The onUpdateCallbackMethod property "onUpdate" is not defined',
        component
      );
    });

    it(`when the onUpdateCallbackMethod option defined an existent method
    it should not log an error to the console`, () => {
      component.onUpdate = () => {};
      BindStateToController('controller', {onUpdateCallbackMethod: 'onUpdate'})(
        component,
        'controllerState'
      );
      component.initialize!();

      expect(console.error).not.toHaveBeenCalled();
    });

    it('should subscribe to the controller', () => {
      jest.spyOn(controller, 'subscribe');
      BindStateToController('controller')(component, 'controllerState');
      component.initialize!();

      expect(controller.subscribe).toHaveBeenCalledTimes(1);
    });
  });
});

describe('initializeBindings method', () => {
  it('rejects when the component is not the children of a search interface element', async () => {
    const element = document.createElement('my-component');
    await expect(initializeBindings(element)).rejects.toEqual(
      new MissingInterfaceParentError('my-component')
    );
  });

  it("revolves the bindings when it's a children of a configured search interface element", async () => {
    const page = await newSpecPage({
      components: [AtomicSearchInterface],
      html: '<atomic-search-interface></atomic-search-interface>',
    });
    const searchInterface = page.body.querySelector('atomic-search-interface')!;
    await searchInterface.initialize({
      accessToken: '123456789',
      organizationId: 'myorg',
    });

    const element = document.createElement('my-component');
    searchInterface.appendChild(element);
    const bindings = await initializeBindings(element);
    expect(bindings).toMatchObject({
      interfaceElement: searchInterface,
      i18n: searchInterface.i18n,
      store: expect.anything(),
      engine: searchInterface.engine,
    });
  });
});
