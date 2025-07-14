import type {Controller} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {bindStateToController} from './bind-state';
import type {InitializableComponent} from './types';

class MockController implements Controller {
  state = {};
  subscribe = vi.fn((callback) => {
    this.callback = callback;
    return () => {};
  });

  callback?: () => void;

  updateState(newState: {}) {
    this.state = newState;
    this.callback?.();
  }
}

describe('@bindStateToController decorator', () => {
  const onUpdateCallbackMethodSpy = vi.fn();
  let element: InitializableComponent<Bindings> & LitElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let controller: MockController;

  @customElement('missing-initialize')
  class MissingInitialize extends LitElement {
    controller!: MockController;
    @bindStateToController('controller')
    controllerState!: MockController['state'];
  }

  @customElement('missing-property')
  class MissingProperty extends LitElement {
    // @ts-expect-error - invalid property
    @bindStateToController('invalidProperty')
    controllerState!: MockController['state'];
    initialize() {}
  }

  @customElement('test-element')
  class TestElement extends LitElement {
    controller!: MockController;
    @bindStateToController('controller')
    controllerState!: MockController['state'];
    initialize() {
      this.controller = controller;
    }
  }

  @customElement('test-element-callback')
  class TestElementCallback extends LitElement {
    controller!: MockController;
    @bindStateToController('controller', {
      onUpdateCallbackMethod: 'onUpdateCallbackMethod',
    })
    controllerState!: MockController['state'];
    onUpdateCallbackMethod = onUpdateCallbackMethodSpy;
    initialize() {
      this.controller = controller;
    }
  }

  @customElement('test-element-no-callback')
  class TestElementNoCallback extends LitElement {
    controller!: MockController;
    @bindStateToController('controller', {
      onUpdateCallbackMethod: 'nonExistentMethod',
    })
    controllerState!: MockController['state'];

    initialize() {
      this.controller = controller;
    }
  }

  const setupElement = async <T extends LitElement>(tag = 'test-element') => {
    element = document.createElement(tag) as InitializableComponent<Bindings> &
      T;
    document.body.appendChild(element);
    await element.updateComplete;
  };

  const teardownElement = () => {
    document.body.removeChild(element);
  };

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    controller = new MockController();
    await setupElement<TestElement>();
  });

  afterEach(() => {
    teardownElement();
    consoleErrorSpy.mockRestore();
  });

  it('it should not disturb the render life cycle', async () => {
    element.initialize!();
    expect(element.hasUpdated).toBe(true);
  });

  it('it should not log an error to the console when the "initialize" method and the "controller" property are defined', () => {
    element.initialize!();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('it should log an error to the console when "controller" property is not defined', async () => {
    await setupElement<MissingProperty>('missing-property');
    element.initialize!();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'invalidProperty property is not defined on component',
      element
    );
  });

  it('it should log an error to the console when the "initialize" method is not defined', async () => {
    await setupElement<MissingInitialize>('missing-initialize');
    element.initialize!();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ControllerState: The "initialize" method has to be defined and instantiate a controller for the property controller',
      element
    );
  });

  it('should subscribe to the controller', async () => {
    element.initialize!();
    expect(controller.subscribe).toHaveBeenCalledTimes(1);
  });

  it('should call the onUpdateCallbackMethod if specified', async () => {
    await setupElement<TestElementCallback>('test-element-callback');
    element.initialize!();
    controller.updateState({value: 'updated state'});
    expect(onUpdateCallbackMethodSpy).toHaveBeenCalled();
  });

  it('should log an error if the onUpdateCallbackMethod is not defined', async () => {
    await setupElement<TestElementNoCallback>('test-element-no-callback');
    element.initialize!();
    controller.updateState({value: 'updated state'});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ControllerState: The onUpdateCallbackMethod property "nonExistentMethod" is not defined',
      element
    );
  });
});
