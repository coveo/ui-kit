import {
  buildSearchBox,
  buildSearchEngine,
  type Controller,
  type SearchEngine,
} from '@coveo/headless';
import {Component, h} from '@stencil/core';
import {newSpecPage, type SpecPage} from '@stencil/core/testing';
import i18next, {type i18n} from 'i18next';
import {AtomicSearchBox} from '../components/search/atomic-search-box/atomic-search-box.js';
import type {Bindings} from '../components/search/atomic-search-interface/atomic-search-interface.js';
import {
  createSearchStore,
  type SearchStore,
} from '../components/search/atomic-search-interface/store.js';
import {markParentAsReady} from './init-queue.js';
import {
  BindStateToController,
  type InitializableComponent,
  InitializeBindings,
} from './initialization-utils.js';

@Component({
  tag: 'atomic-search-interface',
})
class AtomicSearchInterface {
  // biome-ignore lint/suspicious/noExplicitAny: <>
  host!: any;

  engine?: SearchEngine<{}>;
  i18n?: i18n;
  store?: SearchStore;
  bindings?: Bindings;

  async initialize(options: {accessToken: string; organizationId: string}) {
    this.engine = buildSearchEngine({
      configuration: options,
    });
    this.i18n = i18next;
    this.store = createSearchStore();
    this.bindings = {
      engine: this.engine,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
      createScriptElement: jest.fn(),
      createStyleElement: jest.fn(),
    };

    this.host.addEventListener(
      'atomic/initializeComponent',
      (event: CustomEvent) => {
        if (this.bindings) {
          event.detail(this.bindings);
        }
      }
    );

    markParentAsReady(this.host);
  }

  componentOnReady() {
    return Promise.resolve(this);
  }

  render() {
    return h('slot');
  }
}

jest.mock('./replace-breakpoint-utils.ts', () => ({
  ...jest.requireActual('./replace-breakpoint.ts-utils'),
  updateBreakpoints: () => {},
}));

const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

// https://github.com/ionic-team/stencil/issues/3260
// biome-ignore lint/suspicious/noExplicitAny: <>
(global as any).DocumentFragment = class DocumentFragment extends Node {};
// biome-ignore lint/suspicious/noExplicitAny: <>
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

    describe('when the parent is ready', () => {
      beforeEach(async () => {
        page = await newSpecPage({
          components: [AtomicSearchBox, AtomicSearchInterface],
          html: '<atomic-search-interface></atomic-search-interface>',
        });
        const searchInterface = page.body.querySelector(
          'atomic-search-interface'
        )!;
        const searchInterfaceInstance =
          page.rootInstance as AtomicSearchInterface;
        searchInterfaceInstance.host = searchInterface;
        await searchInterfaceInstance.initialize({
          accessToken: '123456789',
          organizationId: 'myorg',
        });
      });
      it('when child component is loaded should dispatch an "atomic/initializeComponent" custom event with the initialize method as detail', async () => {
        let eventContent!: CustomEvent;
        const spy = jest.fn().mockImplementation((event) => {
          eventContent = event;
        });

        page.root!.addEventListener('atomic/initializeComponent', spy);
        page.root!.innerHTML = '<atomic-search-box></atomic-search-box>';
        await page.waitForChanges();

        expect(spy).toHaveBeenCalled();
        expect(typeof eventContent.detail).toBe('function');
      });
    });

    describe('when the parent is not ready', () => {
      let searchInterface: HTMLElement;
      beforeEach(async () => {
        page = await newSpecPage({
          components: [AtomicSearchBox, AtomicSearchInterface],
          html: '<atomic-search-interface></atomic-search-interface>',
        });
        searchInterface = page.body.querySelector('atomic-search-interface')!;
        searchInterface.innerHTML = '<atomic-search-box></atomic-search-box>';
        await page.waitForChanges();
      });

      it('should queue the event', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: <>
        const eventQueueMap = (window as any).initQueueNamespace.eventQueueMap;
        const queue = eventQueueMap.get(searchInterface);
        expect(queue).toBeDefined();
        expect(queue.length).toBeGreaterThan(0);
        expect(queue[0].event.type).toBe('atomic/initializeComponent');
      });

      it('should dispatch queued events when parent becomes ready', async () => {
        const spy = jest.fn();
        searchInterface.addEventListener('atomic/initializeComponent', spy);
        await page.waitForChanges();

        const searchInterfaceInstance =
          page.rootInstance as AtomicSearchInterface;
        searchInterfaceInstance.host = searchInterface;
        await searchInterfaceInstance.initialize({
          accessToken: '123456789',
          organizationId: 'myorg',
        });

        await page.waitForChanges();

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({type: 'atomic/initializeComponent'})
        );
      });
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
      component.bindings = {
        engine: buildSearchEngine({
          configuration: {
            accessToken: 'accessToken',
            organizationId: 'organizationId',
          },
        }),
        i18n: i18next,
        store: createSearchStore(),
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
        store: createSearchStore(),
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
