import {
  AtomicStore,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from './initialization-utils';
import {buildSearchBox, Controller, TestUtils} from '@coveo/headless';
import {newSpecPage, SpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from '../components/atomic-search-interface/atomic-search-interface';
import i18next from 'i18next';
import {AtomicSearchBox} from '../components/atomic-search-box/atomic-search-box';
import {createStore} from '@stencil/store';

describe('InitializeBindings decorator', () => {
  it(`when using the decorator with a property other than bindings 
  should log an error`, () => {
    console.error = jest.fn();
    const component: InitializableComponent = new AtomicSearchBox();
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
    let component: InitializableComponent;

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
    should render nothing `, () => {
      InitializeBindings()(component, 'bindings');
      expect(component.render!()).toBeUndefined();
    });

    it(`when "engine" is defined
    should render the content `, () => {
      component['bindings'] = {
        engine: TestUtils.buildMockSearchAppEngine({
          state: TestUtils.createMockState(),
        }),
        i18n: i18next,
        store: createStore<AtomicStore>({facets: {}}),
      };
      InitializeBindings()(component, 'bindings');
      component.initialize!();

      expect(component.render!()).toBeTruthy();
    });
  });
});

describe('BindStateToController decorator', () => {
  let component: InitializableComponent;

  beforeEach(() => {
    console.error = jest.fn();
    component = {
      bindings: {
        engine: TestUtils.buildMockSearchAppEngine({
          state: TestUtils.createMockState(),
        }),
        i18n: i18next,
        store: createStore<AtomicStore>({facets: {}}),
      },
      error: {} as Error,
    };
  });

  it(`when the "initialize" method is not defined
  it should log a error to the console`, () => {
    BindStateToController('controller')(component, 'controllerState');
    component.initialize!();

    expect(console.error).toHaveBeenCalledWith(
      'ControllerState: The "initialize" method has to be defined and instanciate a controller for the property controller',
      component
    );
  });

  it(`when the "controller" property is not defined
  it should log a error to the console`, () => {
    component.initialize = () => {};
    BindStateToController('controller')(component, 'controllerState');
    component.initialize!();

    expect(console.error).toHaveBeenCalledWith(
      'ControllerState: The controller property "controller" is not defined',
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

    it(`when the onUpdateCallbackMethod option defined a non-existant method
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

    it(`when the onUpdateCallbackMethod option defined an existant method
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
      spyOn(controller, 'subscribe');
      BindStateToController('controller')(component, 'controllerState');
      component.initialize!();

      expect(controller.subscribe).toHaveBeenCalledTimes(1);
    });
  });
});
