import {describe, expect, it} from 'vitest';
import {parseSurfaceSnapshot} from './types.js';
describe('types', () => {
  describe('#parseSurfaceSnapshot', () => {
    describe('Feature: remove-legacy-operation-format, Property 1: Unified surface construction and component normalization', () => {
      it.each([
        {
          surfaceId: 'surface-products',
          initialData: {title: 'Running shoes', count: 2},
          initialComponent: {
            id: 'root-products',
            component: 'ProductCard',
            componentProps: {sku: 'shoe-1', featured: true},
          },
          updatedComponent: {
            id: 'root-actions',
            component: 'NextActionsBar',
          },
        },
        {
          surfaceId: 'surface with spaces',
          initialData: {enabled: true, details: {category: 'boots'}},
          initialComponent: {
            id: 'root-comparison',
            component: 'ComparisonTable',
          },
          updatedComponent: {
            id: 'root-summary',
            component: 'ComparisonSummary',
            componentProps: {expanded: false},
          },
        },
        {
          surfaceId: 'surface-empty-data',
          initialData: {},
          initialComponent: {
            id: 'root-empty',
            component: 'Skeleton',
          },
          updatedComponent: {
            id: 'root-carousel',
            component: 'ProductCarousel',
          },
        },
      ])(
        'should create and normalize the first component for $surfaceId, then normalize an updateComponents component',
        ({surfaceId, initialData, initialComponent, updatedComponent}) => {
          const created = parseSurfaceSnapshot({
            replace: true,
            operations: [
              {
                createSurface: {
                  surfaceId,
                  components: [initialComponent],
                  dataModel: initialData,
                },
              },
            ],
          });
          expect(created).toEqual([
            {
              surfaceId,
              rootId: initialComponent.id,
              componentType: initialComponent.component,
              componentProps: initialComponent.componentProps ?? {},
              data: initialData,
            },
          ]);
          const updated = parseSurfaceSnapshot({
            operations: [
              {
                createSurface: {
                  surfaceId,
                  components: [initialComponent],
                  dataModel: initialData,
                },
              },
              {
                updateComponents: {
                  surfaceId,
                  components: [updatedComponent],
                },
              },
            ],
          });
          expect(updated).toEqual([
            {
              surfaceId,
              rootId: updatedComponent.id,
              componentType: updatedComponent.component,
              componentProps: updatedComponent.componentProps ?? {},
              data: initialData,
            },
          ]);
        }
      );
    });
    it('accepts string component identifiers for createSurface and updateComponents', () => {
      const parsed = parseSurfaceSnapshot({
        operations: [
          {
            createSurface: {
              surfaceId: 'surface-string-components',
              components: [{id: 'comp-1', component: 'ProductCard'}],
            },
          },
          {
            updateComponents: {
              surfaceId: 'surface-string-components',
              components: [
                {
                  id: 'comp-2',
                  component: 'NextActionsBar',
                  componentProps: {actions: ['Show more']},
                },
              ],
            },
          },
        ],
      });

      expect(parsed).toEqual([
        {
          surfaceId: 'surface-string-components',
          rootId: 'comp-2',
          componentType: 'NextActionsBar',
          componentProps: {actions: ['Show more']},
          data: {},
        },
      ]);
    });
    describe('Feature: remove-legacy-operation-format, Property 2: Data-model updates preserve the addressed semantics', () => {
      it.each([
        {
          path: '/',
          value: {status: 'replaced', results: ['new-result']},
          expectedData: {status: 'replaced', results: ['new-result']},
        },
        {
          path: '',
          value: {status: 'reset', count: 0},
          expectedData: {status: 'reset', count: 0},
        },
        {
          path: '/status',
          value: 'updated',
          expectedData: {
            status: 'updated',
            count: 3,
            nested: {preserved: true},
          },
        },
        {
          path: 'count',
          value: 7,
          expectedData: {
            status: 'initial',
            count: 7,
            nested: {preserved: true},
          },
        },
        {
          path: '/nested',
          value: {preserved: false, added: true},
          expectedData: {
            status: 'initial',
            count: 3,
            nested: {preserved: false, added: true},
          },
        },
      ])(
        'should apply the $path update according to root or addressed-entry semantics',
        ({path, value, expectedData}) => {
          const parsed = parseSurfaceSnapshot({
            operations: [
              {
                createSurface: {
                  surfaceId: 'surface-data-model',
                  dataModel: {
                    status: 'initial',
                    count: 3,
                    nested: {preserved: true},
                  },
                },
              },
              {
                updateDataModel: {
                  surfaceId: 'surface-data-model',
                  path,
                  value,
                },
              },
            ],
          });
          expect(parsed).toEqual([
            {
              surfaceId: 'surface-data-model',
              rootId: 'root',
              componentType: '',
              componentProps: {},
              data: expectedData,
            },
          ]);
        }
      );
    });
    describe('Feature: remove-legacy-operation-format, Property 3: Unknown and ignored operations do not affect unified results', () => {
      it('should ignore unsupported and malformed operations while preserving unified results', () => {
        const validOperations = [
          {
            createSurface: {
              surfaceId: 'surface-unified',
              components: [
                {
                  id: 'root-products',
                  component: 'ProductCard',
                  componentProps: {sku: 'shoe-1'},
                },
              ],
              dataModel: {status: 'initial', count: 1},
            },
          },
          {
            updateComponents: {
              surfaceId: 'surface-unified',
              components: [
                {
                  id: 'root-actions',
                  component: 'NextActionsBar',
                  componentProps: {actions: ['Show more']},
                },
              ],
            },
          },
          {
            updateDataModel: {
              surfaceId: 'surface-unified',
              path: '/status',
              value: 'updated',
            },
          },
        ];
        const unifiedSnapshot = {
          replace: true,
          operations: validOperations,
        };
        const mixedSnapshot = {
          replace: true,
          operations: [
            {
              beginRendering: {
                surfaceId: 'surface-unified',
                rootComponent: {id: 'legacy-root'},
              },
            },
            validOperations[0],
            {
              surfaceUpdate: {
                surfaceId: 'surface-unified',
                components: [{id: 'legacy-root', component: {LegacyCard: {}}}],
              },
            },
            {actionResponse: {actionId: 'ignored-action'}},
            null,
            'malformed operation',
            {unsupportedOperation: {surfaceId: 'surface-unified'}},
            {
              updateDataModel: {
                surfaceId: 'unknown-surface',
                path: '/',
                value: {unexpected: true},
              },
            },
            {
              dataModelUpdate: {
                surfaceId: 'surface-unified',
                path: '/status',
                value: 'legacy',
              },
            },
            {updateDataModel: {surfaceId: 123, value: {invalid: true}}},
            validOperations[1],
            validOperations[2],
          ],
        };
        let unifiedResult: ReturnType<typeof parseSurfaceSnapshot> = [];
        let mixedResult: ReturnType<typeof parseSurfaceSnapshot> = [];
        expect(() => {
          unifiedResult = parseSurfaceSnapshot(unifiedSnapshot);
        }).not.toThrow();
        expect(() => {
          mixedResult = parseSurfaceSnapshot(mixedSnapshot);
        }).not.toThrow();
        expect(mixedResult).toEqual(unifiedResult);
      });
    });
    describe('Feature: remove-legacy-operation-format, Property 4: Equivalent unified construction paths are observationally equivalent', () => {
      it.each([
        {
          surfaceId: 'surface-products',
          initialComponent: {
            id: 'root-products',
            component: 'ProductCard',
            componentProps: {sku: 'shoe-1', featured: false},
          },
          intermediateComponent: {
            id: 'root-recommendations',
            component: 'RecommendationList',
            componentProps: {count: 2},
          },
          finalComponent: {
            id: 'root-actions',
            component: 'NextActionsBar',
            componentProps: {actions: ['Show more']},
          },
          initialData: {status: 'initial', count: 1},
          intermediateData: {status: 'intermediate', count: 2},
          finalData: {status: 'final', count: 3, ready: true},
        },
        {
          surfaceId: 'surface with spaces',
          initialComponent: {
            id: 'root-loading',
            component: 'Skeleton',
            componentProps: {size: 'small'},
          },
          intermediateComponent: {
            id: 'root-comparison',
            component: 'ComparisonTable',
            componentProps: {columns: 3},
          },
          finalComponent: {
            id: 'root-summary',
            component: 'ComparisonSummary',
            componentProps: {expanded: true},
          },
          initialData: {category: 'boots', selected: false},
          intermediateData: {category: 'shoes', selected: false},
          finalData: {category: 'shoes', selected: true},
        },
      ])(
        'should produce the same final surface when values arrive in createSurface or subsequent updates',
        ({
          surfaceId,
          initialComponent,
          intermediateComponent,
          finalComponent,
          initialData,
          intermediateData,
          finalData,
        }) => {
          const createdWithFinalValues = parseSurfaceSnapshot({
            replace: true,
            operations: [
              {
                createSurface: {
                  surfaceId,
                  components: [finalComponent],
                  dataModel: finalData,
                },
              },
            ],
          });
          const updatedToFinalValues = parseSurfaceSnapshot({
            replace: true,
            operations: [
              {
                createSurface: {
                  surfaceId,
                  components: [initialComponent],
                  dataModel: initialData,
                },
              },
              {
                updateComponents: {
                  surfaceId,
                  components: [intermediateComponent],
                },
              },
              {
                updateDataModel: {
                  surfaceId,
                  path: '/',
                  value: intermediateData,
                },
              },
              {
                updateComponents: {
                  surfaceId,
                  components: [finalComponent],
                },
              },
              {
                updateDataModel: {
                  surfaceId,
                  path: '/',
                  value: finalData,
                },
              },
            ],
          });
          expect(updatedToFinalValues).toEqual(createdWithFinalValues);
        }
      );
    });
    describe('boundary cases', () => {
      it('should return no surfaces when operations are missing', () => {
        expect(parseSurfaceSnapshot({})).toEqual([]);
      });
      it('should return no surfaces when operations is not an array', () => {
        expect(parseSurfaceSnapshot({operations: {invalid: true}})).toEqual([]);
      });
      it('should return no surfaces when operations is empty', () => {
        expect(parseSurfaceSnapshot({operations: []})).toEqual([]);
      });
      it('should use component and data defaults when createSurface omits both fields', () => {
        expect(
          parseSurfaceSnapshot({
            replace: true,
            operations: [{createSurface: {surfaceId: 'surface-defaults'}}],
          })
        ).toEqual([
          {
            surfaceId: 'surface-defaults',
            rootId: 'root',
            componentType: '',
            componentProps: {},
            data: {},
          },
        ]);
      });
      it('should ignore updates for unknown surfaces', () => {
        expect(
          parseSurfaceSnapshot({
            operations: [
              {
                createSurface: {
                  surfaceId: 'surface-known',
                  components: [
                    {id: 'root-known', component: 'KnownCard', componentProps: {value: 'initial'}},
                  ],
                  dataModel: {status: 'initial'},
                },
              },
              {
                updateComponents: {
                  surfaceId: 'surface-unknown',
                  components: [{id: 'root-unknown', component: 'UnknownCard'}],
                },
              },
              {
                updateDataModel: {
                  surfaceId: 'surface-unknown',
                  path: '/status',
                  value: 'unexpected',
                },
              },
            ],
          })
        ).toEqual([
          {
            surfaceId: 'surface-known',
            rootId: 'root-known',
            componentType: 'KnownCard',
            componentProps: {value: 'initial'},
            data: {status: 'initial'},
          },
        ]);
      });
      it('should treat actionResponse as a no-op', () => {
        expect(
          parseSurfaceSnapshot({
            operations: [
              {
                createSurface: {
                  surfaceId: 'surface-actions',
                  dataModel: {status: 'initial'},
                },
              },
              {actionResponse: {actionId: 'action-1', result: 'ignored'}},
            ],
          })
        ).toEqual([
          {
            surfaceId: 'surface-actions',
            rootId: 'root',
            componentType: '',
            componentProps: {},
            data: {status: 'initial'},
          },
        ]);
      });
      it('should ignore a snapshot containing only legacy operations', () => {
        expect(
          parseSurfaceSnapshot({
            operations: [
              {beginRendering: {surfaceId: 'legacy-surface', rootComponent: {id: 'legacy-root'}}},
              {
                surfaceUpdate: {
                  surfaceId: 'legacy-surface',
                  components: [{id: 'legacy-root', component: {LegacyCard: {}}}],
                },
              },
              {
                dataModelUpdate: {
                  surfaceId: 'legacy-surface',
                  path: '/status',
                  value: 'legacy',
                },
              },
            ],
          })
        ).toEqual([]);
      });
      it('should ignore an unknown operation', () => {
        expect(
          parseSurfaceSnapshot({
            operations: [{unsupportedOperation: {surfaceId: 'surface-unknown'}}],
          })
        ).toEqual([]);
      });
      it('should ignore malformed entries while preserving later valid operations', () => {
        expect(
          parseSurfaceSnapshot({
            operations: [
              null,
              'malformed operation',
              {createSurface: {surfaceId: 123}},
              {updateDataModel: {surfaceId: 'surface-valid'}},
              {
                updateComponents: {
                  surfaceId: 'surface-valid',
                  components: [{id: 'invalid-component', component: {Invalid: 'not-an-object'}}],
                },
              },
              {
                createSurface: {
                  surfaceId: 'surface-valid',
                  dataModel: {status: 'valid'},
                },
              },
            ],
          })
        ).toEqual([
          {
            surfaceId: 'surface-valid',
            rootId: 'root',
            componentType: '',
            componentProps: {},
            data: {status: 'valid'},
          },
        ]);
      });
      it('should preserve valid unified results in a mixed legacy and unified snapshot', () => {
        expect(
          parseSurfaceSnapshot({
            replace: true,
            operations: [
              {beginRendering: {surfaceId: 'surface-mixed', rootComponent: {id: 'legacy-root'}}},
              {
                createSurface: {
                  surfaceId: 'surface-mixed',
                  components: [
                    {id: 'root-unified', component: 'UnifiedCard', componentProps: {sku: 'shoe-1'}},
                  ],
                  dataModel: {status: 'initial'},
                },
              },
              {
                surfaceUpdate: {
                  surfaceId: 'surface-mixed',
                  components: [{id: 'legacy-root', component: {LegacyCard: {}}}],
                },
              },
              {
                dataModelUpdate: {
                  surfaceId: 'surface-mixed',
                  path: '/status',
                  value: 'legacy',
                },
              },
              {actionResponse: {actionId: 'ignored-action'}},
              {unsupportedOperation: {surfaceId: 'surface-mixed'}},
              {
                updateComponents: {
                  surfaceId: 'surface-mixed',
                  components: [
                    {
                      id: 'root-updated',
                      component: 'UpdatedCard',
                      componentProps: {featured: true},
                    },
                  ],
                },
              },
              {
                updateDataModel: {
                  surfaceId: 'surface-mixed',
                  path: '/status',
                  value: 'updated',
                },
              },
            ],
          })
        ).toEqual([
          {
            surfaceId: 'surface-mixed',
            rootId: 'root-updated',
            componentType: 'UpdatedCard',
            componentProps: {featured: true},
            data: {status: 'updated'},
          },
        ]);
      });
    });
  });
});
