import {newSpecPage} from '@stencil/core/testing';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {AtomicTabManager} from './atomic-tab-manager';

describe('atomic-tab-manager', () => {
  let bindings: Bindings;

  beforeEach(() => {
    bindings = {
      i18n: {
        t: jest.fn((key, options) => options?.defaultValue || key),
      },
    } as unknown as Bindings;
  });

  it('should localize the label parameter using bindings.i18n.t', async () => {
    const page = await newSpecPage({
      components: [AtomicTabManager],
      html: '<atomic-tab-manager><atomic-tab label="test-label" name="test-name"></atomic-tab></atomic-tab-manager>',
      supportsShadowDom: false,
    });

    const component = page.rootInstance as AtomicTabManager;
    component.bindings = bindings;
    component.initialize();

    expect(bindings.i18n.t).toHaveBeenCalledWith('test-label', {
      defaultValue: 'test-label',
    });
  });

  it('should localize the name parameter using bindings.i18n.t', async () => {
    const page = await newSpecPage({
      components: [AtomicTabManager],
      html: '<atomic-tab-manager><atomic-tab label="test-label" name="test-name"></atomic-tab></atomic-tab-manager>',
      supportsShadowDom: false,
    });

    const component = page.rootInstance as AtomicTabManager;
    component.bindings = bindings;
    component.initialize();

    expect(bindings.i18n.t).toHaveBeenCalledWith('test-name', {
      defaultValue: 'test-name',
    });
  });
});
