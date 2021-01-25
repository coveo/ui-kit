import {
  InitializableComponent,
  InitializeBindings,
} from './initialization-utils';
import {AtomicPager} from '../components/atomic-pager/atomic-pager';
import {TestUtils} from '@coveo/headless';
import {newSpecPage, SpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from '../components/atomic-search-interface/atomic-search-interface';
import i18next from 'i18next';

describe('InitializeBindings decorator', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  it(`when using the decorator with a property other than bindings 
  should log an error`, () => {
    const component: InitializableComponent = new AtomicPager();
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
        .querySelector('atomic-pager')!
        .shadowRoot!.querySelector('atomic-component-error');
    }

    it(`when the child-component component is not the child of an atomic-search-interface component
    should set an error`, async () => {
      page = await newSpecPage({
        components: [AtomicPager],
        html: '<atomic-pager></atomic-pager>',
      });
      expect(getErrorComponent()).toBeTruthy();
    });

    it(`when child component is loaded
    should dispatch an "atomic/initializeComponent" custom event with the initialize method as detail`, async () => {
      page = await newSpecPage({
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

  describe('render method override', () => {
    let component: InitializableComponent;

    beforeEach(() => {
      component = new AtomicPager();
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
      };
      InitializeBindings()(component, 'bindings');
      component.initialize!();

      expect(component.render!()).toBeTruthy();
    });
  });
});
