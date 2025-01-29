import {buildSearchEngine} from '@coveo/headless';
import {i18n} from 'i18next';
import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Mock, vi} from 'vitest';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {createSearchStore} from '../components/search/atomic-search-interface/store';
import {fetchBindings} from '../utils/initialization-lit-stencil-common-utils';
import {initializeBindings} from './initialize-bindings';
import {InitializableComponent} from './types';

vi.mock('../utils/initialization-lit-stencil-common-utils', () => ({
  fetchBindings: vi.fn(),
}));

const mockBindings = () => ({
  engine: buildSearchEngine({
    configuration: {
      accessToken: 'accessToken',
      organizationId: 'organizationId',
    },
  }),
  i18n: {on: vi.fn(), off: vi.fn()} as unknown as i18n,
  store: createSearchStore(),
});

@customElement('test-element')
export class TestElement
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @initializeBindings()
  @state()
  public bindings!: Bindings;
  @state() public error!: Error;

  public render() {
    return html``;
  }

  public initialize() {}
}

@customElement('test-element-no-initialize')
export class TestElementNoInitialize extends LitElement {
  @initializeBindings()
  @state()
  public bindings!: Bindings;
  @state() public error!: Error;

  public render() {
    return html``;
  }
}

@customElement('test-element-invalid-bindings-property')
// @ts-expect-error - invalid property
export class TestElementNoBindings
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @initializeBindings()
  @state()
  public invalidProp!: Bindings;
  @state() public error!: Error;

  public render() {
    return html``;
  }

  public initialize() {}
}

describe('@initializeBindings decorator', () => {
  let element: InitializableComponent<Bindings> & LitElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const mockedFetchBindings = fetchBindings as Mock;

  const setupElement = async <T extends LitElement>(tag = 'test-element') => {
    element = document.createElement(tag) as InitializableComponent<Bindings> &
      T;
    document.body.appendChild(element);
    await element.updateComplete;
  };

  const teardownElement = () => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  };

  beforeEach(async () => {
    mockedFetchBindings.mockImplementation(() =>
      Promise.resolve(mockBindings())
    );
    consoleErrorSpy = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    teardownElement(); // TODO: need to call it manually
    consoleErrorSpy.mockRestore();
    mockedFetchBindings.mockRestore(); // TODO: not sure
  });

  // it('should update the state when bindings are present', async () => {
  //   const bindings = new MockBindings();
  //   (buildCustomEvent as any).mockImplementation((_, callback) => {
  //     callback(bindings);
  //     return new Event('initialize');
  //   });
  //   (closest as any).mockReturnValue(true);

  //   element.requestUpdate();
  //   await element.updateComplete;

  //   expect(element.shadowRoot?.textContent).toContain('Bindings present');
  // });

  // it('should log an error if the initialize method is not defined', async () => {
  //   await setupElement('test-element-no-initialize');
  //   element.requestUpdate();
  //   await element.updateComplete;

  //   expect(consoleErrorSpy).toHaveBeenCalledWith(
  //     'ControllerState: The "initialize" method has to be defined and instantiate a controller for the property controller',
  //     element
  //   );
  // });

  // it('should log an error if bindings are not instantiated in the initialize method', async () => {
  //   await setupElement('test-element-no-bindings');
  //   element.requestUpdate();
  //   await element.updateComplete;

  //   expect(consoleErrorSpy).toHaveBeenCalledWith(
  //     'ControllerState: The "initialize" method has to be defined and instantiate a controller for the property controller',
  //     element
  //   );
  // });

  it('should log an error when using the decorator with a property other than bindings ', async () => {
    await setupElement<TestElementNoBindings>(
      'test-element-invalid-bindings-property'
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'The InitializeBindings decorator should be used on a property called "bindings", and not "invalidProp"',
      element
    );
  });

  it('should return an error to the element if unable to fetch bindings', async () => {
    mockedFetchBindings.mockRejectedValue(new Error('test-element'));
    await setupElement();

    // element.requestUpdate();
    // await element.updateComplete;

    expect(element.error).toBeInstanceOf(Error);
  });
});

// describe('#fetchBindings method', () => {
// })
