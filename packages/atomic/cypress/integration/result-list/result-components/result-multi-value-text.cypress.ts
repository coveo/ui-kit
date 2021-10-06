import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {addFacet} from '../../facets/facet/facet-actions';
import {FacetSelectors} from '../../facets/facet/facet-selectors';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  assertShouldRenderValues,
  assertDisplaysXMoreLabel,
  assertDoesNotDisplayXMoreLabel,
} from './result-multi-value-text-assertions';
import {
  resultMultiValueTextComponent,
  ResultMultiValueTextSelectors,
} from './result-multi-value-text-selectors';
import * as CommonFacetAssertions from '../../facets/facet-common-assertions';

export interface MultiValueTextProps {
  field?: string | number;
  'max-values-to-display'?: number;
}

const addMultiValueText = (
  props: MultiValueTextProps = {},
  slot: HTMLElement[] = []
) => {
  const multiValueTextEl = generateComponentHTML(
    resultMultiValueTextComponent,
    props as TagProps
  );
  slot.forEach((el) => multiValueTextEl.appendChild(el));
  return addResultList(
    buildTemplateWithSections({bottomMetadata: multiValueTextEl})
  );
};

export interface FacetWithResponseProps {
  facetId: string;
  field: string;
  values: string[];
  selectedValues: string[];
}

const addFacetWithResponse =
  ({facetId, field, values, selectedValues}: FacetWithResponseProps) =>
  (fixture: TestFixture) => {
    fixture
      .with(addFacet({'facet-id': facetId, field}))
      .withCustomResponse((response) => {
        response.facets = [
          {
            facetId,
            field,
            indexScore: 0,
            moreValuesAvailable: false,
            values: values.map((value) => ({
              value,
              numberOfResults: 1337,
              state: selectedValues.includes(value) ? 'selected' : 'idle',
            })),
          },
        ];
      });
  };

describe('Result MultiValueText Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultMultiValueTextComponent))
        .init();
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(resultMultiValueTextComponent).should('not.exist');
    });

    it.skip('should log a console error', () => {
      cy.get(resultMultiValueTextComponent)
        .shadow()
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when used inside a result template', () => {
    describe('when the field does not exist for the result', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addMultiValueText({field: 'thisfielddoesnotexist'}))
          .init();
      });

      it.skip('should remove the component from the DOM', () => {
        ResultMultiValueTextSelectors.firstInResult().should('not.exist');
      });
    });

    describe('when the field value is not a string nor a string array', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addMultiValueText({field: 420}))
          .withCustomResponse((response) => {
            response.results.forEach((result) => (result.raw['420'] = 'Abc'));
          })
          .init();
      });

      it.skip('should remove the component from the DOM', () => {
        ResultMultiValueTextSelectors.firstInResult().should('not.exist');
      });
    });

    describe('when the field value exists & is a string array', () => {
      const field = 'hello_world';
      function prepareValuesWithMaximum(
        valuesAndCaptions: Record<string, string>,
        maxValuesToDisplay: number,
        slot: HTMLElement[] = []
      ) {
        return new TestFixture()
          .with(
            addMultiValueText(
              {field, 'max-values-to-display': maxValuesToDisplay},
              slot
            )
          )
          .withCustomResponse((response) => {
            response.results.forEach((result) => {
              result.raw[field] = Object.keys(valuesAndCaptions);
            });
          })
          .withFieldCaptions(field, valuesAndCaptions)
          .withTranslation({'n-more': '{{value}} more'});
      }

      describe('with 2 values', () => {
        const values = {
          first: 'The first value',
          second: 'The last value',
        };
        const localizedValues = Object.values(values);

        describe('with max-values-to-display=1', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 1).init();
          });

          assertShouldRenderValues(localizedValues.slice(0, 1));

          assertDisplaysXMoreLabel(1);
        });
      });

      describe('with 3 values', () => {
        const values = {
          first: 'The first value',
          second: 'Another value',
          third: 'The last value',
        };
        const localizedValues = Object.values(values);

        describe('with max-values-to-display=1', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 1).init();
          });

          assertShouldRenderValues(localizedValues.slice(0, 1));

          assertDisplaysXMoreLabel(2);
        });

        describe('with max-values-to-display=2', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 2);
          });

          assertShouldRenderValues(localizedValues.slice(0, 1));

          assertDisplaysXMoreLabel(2);
        });
      });

      describe('with 4 values', () => {
        const values = {
          first: 'The first value',
          second: 'Another value',
          third: 'Almost the last value',
          fourth: 'The last value',
        };
        const localizedValues = Object.values(values);

        describe('with max-values-to-display=1', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 1).init();
          });

          assertShouldRenderValues(localizedValues.slice(0, 1));

          assertDisplaysXMoreLabel(3);
        });

        describe('with max-values-to-display=2', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 2).init();
          });

          assertShouldRenderValues(localizedValues.slice(0, 2));

          assertDisplaysXMoreLabel(2);
        });

        describe('with max-values-to-display=3', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 3).init();
          });

          assertShouldRenderValues(localizedValues.slice(0, 2));

          assertDisplaysXMoreLabel(2);

          it.skip('should pass accessibility tests', () => {
            cy.checkA11y();
          });
        });

        describe('with max-values-to-display=4', () => {
          const rawValues = Object.keys(values);

          describe('by default', () => {
            beforeEach(() => {
              prepareValuesWithMaximum(values, 4).init();
            });

            assertShouldRenderValues(localizedValues);

            assertDoesNotDisplayXMoreLabel();

            it.skip('should pass accessibility tests', () => {
              cy.checkA11y();
            });
          });

          describe('with slots', () => {
            const buildSlotElement = (value: string, text: string) => {
              const el = generateComponentHTML('span', {
                slot: `result-multi-value-text-value-${value}`,
              });
              el.innerText = text;
              return el;
            };

            beforeEach(() => {
              prepareValuesWithMaximum(values, 4, [
                buildSlotElement(rawValues[1], 'A'),
                buildSlotElement(rawValues[3], 'B'),
              ]).init();
            });

            assertShouldRenderValues(
              [localizedValues[0], 'A', localizedValues[2], 'B'],
              'should replace the correct values'
            );

            it.skip('should pass accessibility tests', () => {
              cy.checkA11y();
            });
          });

          describe('with a facet and two selected values', () => {
            const facetId = 'blah';
            const selectedValues = [rawValues[1], rawValues[2]];
            beforeEach(() => {
              prepareValuesWithMaximum(values, 4)
                .with(
                  addFacetWithResponse({
                    facetId,
                    field,
                    values: rawValues,
                    selectedValues,
                  })
                )
                .init();
            });

            CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);

            assertShouldRenderValues(
              [
                localizedValues[1],
                localizedValues[2],
                localizedValues[0],
                localizedValues[3],
              ],
              'displays the selected values first'
            );
          });
        });

        describe('with max-values-to-display=5', () => {
          beforeEach(() => {
            prepareValuesWithMaximum(values, 5).init();
          });

          assertShouldRenderValues(localizedValues);

          assertDoesNotDisplayXMoreLabel();
        });
      });
    });
  });
});
