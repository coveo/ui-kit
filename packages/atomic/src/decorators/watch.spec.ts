import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {vi} from 'vitest';
import {watch} from './watch.js';

@customElement('test-element')
class TestElement extends LitElement {
  @property({type: String}) myProp: string = 'initial value';

  @watch('myProp')
  public onMyPropChange(_oldValue?: string, _newValue?: string) {}

  @watch('myProp', {waitUntilFirstUpdate: true})
  public afterFirstRender(_oldValue?: string, _newValue?: string) {}
}

describe('@watch decorator', () => {
  let element: TestElement;
  let onMyPropChangeSpy: ReturnType<typeof vi.spyOn>;
  let afterFirstRenderSpy: ReturnType<typeof vi.spyOn>;

  const setupElement = async () => {
    // TODO: use @open-wc/testing package for fixture and helpers
    element = document.createElement('test-element') as TestElement;
    document.body.appendChild(element);
    onMyPropChangeSpy = vi.spyOn(element, 'onMyPropChange');
    afterFirstRenderSpy = vi.spyOn(element, 'afterFirstRender');
  };

  const teardownElement = () => {
    document.body.removeChild(element);
    onMyPropChangeSpy.mockRestore();
    afterFirstRenderSpy.mockRestore();
  };

  beforeEach(() => {
    setupElement();
  });

  afterEach(() => {
    teardownElement();
  });

  describe('when #waitUntilFirstUpdate is false', () => {
    it('should call the watch on the first render', async () => {
      expect(onMyPropChangeSpy).toHaveBeenCalledTimes(1);
      expect(onMyPropChangeSpy).toHaveBeenCalledWith(
        undefined,
        'initial value'
      );
    });
  });

  describe('when #waitUntilFirstUpdate is true', () => {
    it('should not call the watch on the first render', async () => {
      expect(afterFirstRenderSpy).not.toHaveBeenCalled();
    });

    it('should call the watch after a first manual update', async () => {
      element.myProp = 'new value';
      await element.updateComplete;

      expect(afterFirstRenderSpy).toHaveBeenCalledTimes(1);
      expect(afterFirstRenderSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );
    });
  });

  describe('property change behavior', () => {
    it('should call the watch method when the property changes', async () => {
      element.myProp = 'new value';
      await element.updateComplete;

      expect(onMyPropChangeSpy).toHaveBeenCalledTimes(2);
      expect(onMyPropChangeSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );

      expect(afterFirstRenderSpy).toHaveBeenCalledTimes(1);
      expect(afterFirstRenderSpy).toHaveBeenCalledWith(
        'initial value',
        'new value'
      );
    });

    it('should not call the watch method when a different property changes', async () => {
      element.requestUpdate('anotherProp', 'new value');
      await element.updateComplete;

      expect(afterFirstRenderSpy).not.toHaveBeenCalled();
    });

    it('should not call the watch method if the property value does not change', async () => {
      element.myProp = 'initial value';
      await element.updateComplete;

      expect(afterFirstRenderSpy).not.toHaveBeenCalled();
    });
  });
});
