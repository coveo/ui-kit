import {Initialization} from './initialization-utils';
import {Component, Prop} from '@stencil/core';
import {Engine, TestUtils} from '@coveo/headless';
import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from '../components/atomic-search-interface/atomic-search-interface';

describe('Initialization decorator', () => {
  describe('render method override', () => {
    @Component()
    class WithoutRender {}

    @Component()
    class WithRender {
      render() {
        return 'content';
      }
    }

    @Component()
    class WithRenderAndEngine {
      error?: Error;
      engine!: Engine;
      render() {
        return 'content';
      }
    }

    beforeEach(() => {
      console.error = jest.fn();
    });

    it(`when the render method is not defined
    should render nothing AND log an error to the console`, () => {
      const component = new WithoutRender();
      Initialization()(component, 'initialize');
      expect(console.error).toHaveBeenCalled();
      expect((component as WithRender).render()).toBeUndefined();
    });

    it(`when the render method is defined
    should not log an error to the console`, () => {
      const component = new WithRender();
      Initialization()(component, 'initialize');
      expect(console.error).not.toHaveBeenCalled();
    });

    it(`when "error" is defined
    should render an atomic-component-error component`, () => {
      const component = new WithRenderAndEngine();
      Initialization()(component, 'initialize');
      component.error = new Error('oups');
      expect(component.render()).toMatchObject({
        $tag$: 'atomic-component-error',
      });
    });

    it(`when "engine" is not defined
    should render nothing `, () => {
      const component = new WithRenderAndEngine();
      Initialization()(component, 'initialize');
      expect(component.render()).toBeUndefined();
    });

    it(`when "engine" is defined
    should render the content `, () => {
      const component = new WithRenderAndEngine();
      Initialization()(component, 'initialize');
      component.engine = TestUtils.buildMockEngine();
      expect(component.render()).toBe('content');
    });
  });

  describe('componentWillLoad method override', () => {
    @Component({
      tag: 'atomic-child',
      shadow: true,
    })
    class AtomicChild {
      @Prop() error?: Error;

      @Initialization()
      initialize() {}

      render() {
        return 'content';
      }
    }

    it(`when the atomic-child component is not the child of an atomic-search-interface component
    should set an InitializationError error`, async () => {
      const page = await newSpecPage({
        components: [AtomicChild],
        html: '<atomic-child></atomic-child>',
      });
      const component = page.body.querySelector('atomic-child') as any;
      expect(component.error.name).toBe('InitializationError');
    });

    it(`when the atomic-child component is the child of an atomic-search-interface component
    should not set an error`, async () => {
      const page = await newSpecPage({
        components: [AtomicChild, AtomicSearchInterface],
        html: `<atomic-search-interface>
        <atomic-child></atomic-child>
        </atomic-search-interface>`,
      });
      const component = page.body.querySelector('atomic-child') as any;
      expect(component.error).toBeUndefined();
    });

    it(`when child component is loaded
    should dispatch an "atomic/initializeComponent" custom event with the initialize method as detail`, async () => {
      const page = await newSpecPage({
        components: [AtomicChild, AtomicSearchInterface],
        html: '<atomic-search-interface></atomic-search-interface>',
      });

      let eventContent!: CustomEvent;
      const spy = jest
        .fn()
        .mockImplementation((event) => (eventContent = event));
      page.root!.addEventListener('atomic/initializeComponent', spy);
      page.root!.innerHTML = '<atomic-child></atomic-child>';

      await page.waitForChanges();

      expect(spy).toHaveBeenCalled();
      expect(typeof eventContent.detail).toBe('function');
    });
  });

  describe('initalization of the child component', () => {
    let initializeSpy: jest.Mock;

    @Component({
      tag: 'atomic-child',
      shadow: true,
    })
    class AtomicChild {
      @Prop() engine!: Engine;

      @Initialization()
      initialize() {
        initializeSpy();
      }

      render() {}
    }

    @Component({
      tag: 'atomic-child-errored',
      shadow: true,
    })
    class AtomicChildErrored {
      @Prop() engine!: Engine;
      @Prop() error?: Error;

      @Initialization()
      initialize() {
        throw new Error();
      }

      render() {}
    }

    beforeEach(() => {
      initializeSpy = jest.fn();
    });

    it(`when the atomic-search-interface creates the engine instance
    when the initialize method doesn't throw an error
    should call the initialize method on it's children and set the engine property`, async () => {
      const page = await newSpecPage({
        components: [AtomicChild, AtomicSearchInterface],
        html: `<atomic-search-interface sample>
        <atomic-child></atomic-child>
        </atomic-search-interface>`,
      });

      expect(initializeSpy).toHaveBeenCalled();
      const component = page.body.querySelector('atomic-child') as any;
      expect(component.engine).toBeTruthy();
    });

    it(`when the atomic-search-interface creates the engine instance
    when the initialize method throws an error
    should set the error & engine properties`, async () => {
      const page = await newSpecPage({
        components: [AtomicChildErrored, AtomicSearchInterface],
        html: `<atomic-search-interface sample>
        <atomic-child-errored></atomic-child-errored>
        </atomic-search-interface>`,
      });

      const component = page.body.querySelector('atomic-child-errored') as any;
      expect(component.engine).toBeTruthy();
      expect(component.error).toBeTruthy();
    });
  });
});
