import {describe, expect, it} from 'vitest';
import {toCatalogSurfaces} from './adapter.js';

describe('toCatalogSurfaces', () => {
  it('keeps advertised components bound to their externally owned controller state', () => {
    const [surface] = toCatalogSurfaces([
      {
        id: 'catalog',
        kind: 'a2ui-surface',
        replace: true,
        payload: {
          a2ui_operations: [
            {
              version: 'v0.9',
              createSurface: {surfaceId: 'catalog', catalogId: 'catalog.json'},
            },
            {
              version: 'v0.9',
              updateComponents: {
                surfaceId: 'catalog',
                components: [
                  {
                    id: 'featured-products',
                    component: 'ProductCarousel',
                    controllers: {
                      productListController: {
                        controllerId: 'featured-products',
                        controllerSchema: 'product-list.schema.json',
                      },
                    },
                  },
                ],
              },
            },
            {
              version: 'v0.9',
              updateDataModel: {
                surfaceId: 'catalog',
                value: {controllers: {'featured-products': {products: [{permanentid: 'p1'}]}}},
              },
            },
          ],
        },
      },
    ]);

    expect(surface).toMatchObject({
      id: 'catalog',
      catalogId: 'catalog.json',
      components: [{component: 'ProductCarousel'}],
      controllers: {'featured-products': {products: [{permanentid: 'p1'}]}},
    });
  });

  it('resets prior surfaces when an activity declares replacement semantics', () => {
    const surfaces = toCatalogSurfaces([
      {
        id: 'old',
        kind: 'a2ui-surface',
        replace: false,
        payload: {a2ui_operations: [{version: 'v0.9', createSurface: {surfaceId: 'old'}}]},
      },
      {
        id: 'new',
        kind: 'a2ui-surface',
        replace: true,
        payload: {a2ui_operations: [{version: 'v0.9', createSurface: {surfaceId: 'new'}}]},
      },
    ]);

    expect(surfaces.map(({id}) => id)).toEqual(['new']);
  });
});
