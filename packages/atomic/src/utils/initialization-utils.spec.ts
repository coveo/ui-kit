import {Initialization} from './initialization-utils';
import {AtomicPager} from '../components/atomic-pager/atomic-pager';
import type {ComponentInterface} from '@stencil/core';
import {TestUtils} from '@coveo/headless';
import {newSpecPage, SpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from '../components/atomic-search-interface/atomic-search-interface';

interface AtomicComponent extends ComponentInterface {
  error?: Error;
}

describe('Initialization decorator', () => {
  describe('render method override', () => {
    beforeEach(() => {
      console.error = jest.fn();
    });

    it(`when the render method is not defined
    should render nothing AND log an error to the console`, () => {
      const render = AtomicPager.prototype.render;
      AtomicPager.prototype.render = undefined as never;
      const component = new AtomicPager();
      Initialization()(component, 'initialize');
      expect(console.error).toHaveBeenCalled();
      expect(component.render()).toBeUndefined();

      AtomicPager.prototype.render = render;
    });

    it(`when the render method is defined
    should not log an error to the console`, () => {
      const component = new AtomicPager();
      Initialization()(component, 'initialize');

      expect(console.error).not.toHaveBeenCalled();
    });

    it(`when "error" is defined
    should render an atomic-component-error component`, () => {
      const component: AtomicComponent = new AtomicPager();
      Initialization()(component, 'initialize');
      component.error = new Error('oups');

      expect(component.render!()).toMatchObject({
        $tag$: 'atomic-component-error',
      });
    });

    it(`when "engine" is not defined
    should render nothing `, () => {
      const component = new AtomicPager();
      Initialization()(component, 'initialize');
      expect(component.render()).toBeUndefined();
    });

    it(`when "engine" is defined
    should render the content `, () => {
      const component = new AtomicPager();
      component['engine'] = TestUtils.buildMockSearchAppEngine({
        state: TestUtils.createMockState(),
      });
      Initialization()(component, 'initialize');
      component.initialize();

      expect(component.render()).toBeTruthy();
    });
  });

  describe('componentWillLoad method override', () => {
    let page: SpecPage;

    function getErrorComponent() {
      return page.body
        .querySelector('atomic-pager')!
        .shadowRoot!.querySelector('atomic-component-error');
    }

    it(`when the child-component component is not the child of an atomic-search-interface component
    should set an InitializationError error`, async () => {
      page = await newSpecPage({
        components: [AtomicPager],
        html: '<atomic-pager></atomic-pager>',
      });
      expect(getErrorComponent()).toBeTruthy();
    });

    it(`when the child-component component is the child of an atomic-search-interface component
    should not set an error`, async () => {
      page = await newSpecPage({
        components: [AtomicPager, AtomicSearchInterface],
        html: `<atomic-search-interface>
        <atomic-pager></atomic-pager>
        </atomic-search-interface>`,
      });
      expect(getErrorComponent()).toBeFalsy();
    });

    it(`when child component is loaded
    should dispatch an "atomic/initializeComponent" custom event with the initialize method as detail`, async () => {
      const page = await newSpecPage({
        components: [AtomicPager, AtomicSearchInterface],
        html: '<atomic-search-interface></atomic-search-interface>',
      });
      let eventContent!: CustomEvent;
      const spy = jest
        .fn()
        .mockImplementation((event) => (eventContent = event));
      page.root!.addEventListener('atomic/initializeComponent', spy);
      page.root!.innerHTML = '<atomic-pager></atomic-pager>';
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
      expect(typeof eventContent.detail).toBe('function');
    });
  });
});
