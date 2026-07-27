import {describe, expect, it, vi} from 'vitest';
import {ThermidorControllerRegistry} from './controllers.js';

describe('ThermidorControllerRegistry', () => {
  it('hydrates a component-created controller and notifies it about subsequent data-model updates', () => {
    const registry = new ThermidorControllerRegistry();
    const advertisement = {
      controllerId: 'featured-products',
      controllerSchema: 'product-list.schema.json',
    };
    registry.synchronize([
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'catalog',
          value: {controllers: {'featured-products': {products: [{permanentid: 'p1'}]}}},
        },
      },
    ]);

    const controller = registry.getOrCreate(advertisement);
    expect(controller.snapshot).toEqual({products: [{permanentid: 'p1'}]});

    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    registry.synchronize([
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'catalog',
          value: {controllers: {'featured-products': {products: [{permanentid: 'p1'}]}}},
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'catalog',
          path: '/controllers/featured-products/products',
          value: [{permanentid: 'p2'}],
        },
      },
    ]);

    expect(controller.snapshot).toEqual({products: [{permanentid: 'p2'}]});
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
