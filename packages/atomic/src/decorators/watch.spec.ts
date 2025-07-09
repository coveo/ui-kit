import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {watch} from './watch.js';

@customElement('test-element')
class TestElement extends LitElement {
  @property({type: String}) myProp: string = 'initial value';

  @watch('myProp', {waitUntilFirstUpdate: false})
  public withWaitUntilFirstUpdateFalse(
    _oldValue?: string,
    _newValue?: string
  ) {}

  @watch('myProp')
  public withWaitUntilFirstUpdateTrue(_oldValue?: string, _newValue?: string) {}
}

describe('@watch decorator', () => {
  let element: TestElement;
  let withWaitUntilFirstUpdateFalseSpy: ReturnType<typeof vi.spyOn>;
  let withWaitUntilFirstUpdateTrueSpy: ReturnType<typeof vi.spyOn>;

  const setupElement = async () => {
    // TODO: use @open-wc/testing package for fixture and helpers
    element = document.createElement('test-element') as TestElement;
    document.body.appendChild(element);
    withWaitUntilFirstUpdateFalseSpy = vi.spyOn(
      element,
      'withWaitUntilFirstUpdateFalse'
    );
    withWaitUntilFirstUpdateTrueSpy = vi.spyOn(
      element,
      'withWaitUntilFirstUpdateTrue'
    );
  };

  const teardownElement = () => {
    document.body.removeChild(element);
    withWaitUntilFirstUpdateFalseSpy.mockRestore();
    withWaitUntilFirstUpdateTrueSpy.mockRestore();
  };

  beforeEach(async () => {
    await setupElement();
  });

  afterEach(() => {
    teardownElement();
  });

  describe('when #waitUntilFirstUpdate is false', () => {
    it('should call the watch on the first render', async () => {
      expect(withWaitUntilFirstUpdateFalseSpy).toHaveBeenCalledTimes(1);
      expect(withWaitUntilFirstUpdateFalseSpy).toHaveBeenCalledWith(
        undefined,
        'initial value'
      );
    });
  });

  describe('when #waitUntilFirstUpdate is true', () => {
    it('should not call the watch on the first render', async () => {
      expect(withWaitUntilFirstUpdateTrueSpy).not.toHaveBeenCalled();
    });

    it('should call the watch after a first manual update', async () => {
      element.myProp = 'new value';
      await element.updateComplete;

      expect(withWaitUntilFirstUpdateTrueSpy).toHaveBeenCalledTimes(1);
      expect(withWaitUntilFirstUpdateTrueSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );
    });
  });

  describe('property change behavior', () => {
    it('should call the watch method when the property changes', async () => {
      element.myProp = 'new value';
      await element.updateComplete;

      expect(withWaitUntilFirstUpdateFalseSpy).toHaveBeenCalledTimes(2);
      expect(withWaitUntilFirstUpdateFalseSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );

      expect(withWaitUntilFirstUpdateTrueSpy).toHaveBeenCalledTimes(1);
      expect(withWaitUntilFirstUpdateTrueSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );
    });

    it('should not call the watch method when a different property changes', async () => {
      element.requestUpdate('anotherProp', 'new value');
      await element.updateComplete;

      expect(withWaitUntilFirstUpdateTrueSpy).not.toHaveBeenCalled();
    });

    it('should not call the watch method if the property value does not change', async () => {
      element.myProp = 'initial value';
      await element.updateComplete;

      expect(withWaitUntilFirstUpdateTrueSpy).not.toHaveBeenCalled();
    });
  });
});
