import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {addFacet} from '../../facets/facet/facet-actions';
import {FacetSelectors} from '../../facets/facet/facet-selectors';
import {
  addFieldValueInResponse,
  addResultList,
  buildTemplateWithSections,
} from '../result-list-actions';
import {
  assertShouldRenderValues,
  assertDisplaysXMoreLabel,
  assertDoesNotDisplayXMoreLabel,
} from './result-multi-value-text-assertions';
import {resultMultiValueTextComponent} from './result-multi-value-text-selectors';
import * as CommonFacetAssertions from '../../facets/facet-common-assertions';
import {
  assertAccessibility,
  assertConsoleError,
  assertRemovesComponent,
} from '../../common-assertions';
import {
  resultListComponent,
  ResultListSelectors,
} from '../result-list-selectors';

export interface MultiValueTextProps {
  field?: string | number;
  'max-values-to-display'?: number;
  delimiter?: string;
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

    assertRemovesComponent(() => cy.get(resultMultiValueTextComponent));
    assertConsoleError();
  });

  describe('when used inside a result template', () => {
    describe('when the field does not exist for the result', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addMultiValueText({field: 'thisfielddoesnotexist'}))
          .init();
      });

      assertRemovesComponent(() =>
        ResultListSelectors.firstResult().find(resultMultiValueTextComponent)
      );
    });

    describe('when the field value is not a string nor a string array', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addMultiValueText({field: 'hello'}))
          .with(addFieldValueInResponse('hello', 420))
          .init();
      });

      assertRemovesComponent(() =>
        ResultListSelectors.firstResult().find(resultMultiValueTextComponent)
      );
      assertConsoleError();
    });

    function testWithValidFieldValue(
      getFieldValues: (valuesToTest: string[]) => string | string[],
      delimiter?: string
    ) {
      const field = 'hello_world';
      function prepareValuesWithMaximum(
        valuesAndCaptions: Record<string, string>,
        maxValuesToDisplay: number,
        slot: HTMLElement[] = []
      ) {
        return new TestFixture()
          .with(
            addMultiValueText(
              {
                field,
                'max-values-to-display': maxValuesToDisplay,
                ...(delimiter ? {delimiter} : {}),
              },
              slot
            )
          )
          .with(
            addFieldValueInResponse(
              field,
              getFieldValues(Object.keys(valuesAndCaptions))
            )
          )
          .withFieldCaptions(field, valuesAndCaptions)
          .withTranslation({'n-more': '{{value}} more'});
      }

      describe('and the field has an array of 2 values', () => {
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

      describe('and the field has an array of 3 values', () => {
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

      describe('and the field has an array of 4 values', () => {
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
          assertAccessibility(resultListComponent);
        });

        describe('with max-values-to-display=4', () => {
          const rawValues = Object.keys(values);

          describe('by default', () => {
            beforeEach(() => {
              prepareValuesWithMaximum(values, 4).init();
            });

            assertShouldRenderValues(localizedValues);
            assertDoesNotDisplayXMoreLabel();
            assertAccessibility(resultListComponent);
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

            assertAccessibility(resultListComponent);
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
    }

    describe('when the field value exists & is a string array', () => {
      testWithValidFieldValue((valuesToTest) =>
        valuesToTest.map((value) => ` ${value} `)
      );
    });

    describe('when the field value exists & is a string', () => {
      testWithValidFieldValue(
        (valuesToTest) => valuesToTest.map((value) => ` ${value} `).join(';'),
        ';'
      );
    });
  });
});
