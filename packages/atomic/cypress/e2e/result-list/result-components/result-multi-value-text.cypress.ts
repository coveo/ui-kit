import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addFacet} from '../../facets/facet/facet-actions';
import {
  addFieldValueInResponse,
  addResultList,
  buildTemplateWithSections,
} from '../result-list-actions';
import {
  assertDisplaysXMoreLabel,
  assertDoesNotDisplayXMoreLabel,
  assertShouldRenderValues,
} from './result-multi-value-text-assertions';
import {
  resultMultiValueTextComponent,
  ResultMultiValueTextSelectors,
} from './result-multi-value-text-selectors';

export interface MultiValueTextProps {
  field?: string | number;
  'max-values-to-display'?: number;
  delimiter?: string;
}

const addMultiValueText = (
  props: MultiValueTextProps = {},
  slot?: HTMLElement
) => {
  const multiValueTextEl = generateComponentHTML(
    resultMultiValueTextComponent,
    props as TagProps
  );
  slot && multiValueTextEl.appendChild(slot);
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

describe('Result MultiValueText Component', () => {
  const values = {
    first: 'The first value',
    second: 'The second value',
    third: 'The third value',
  };
  const field = 'hello_world';
  const localizedValues = Object.values(values);
  const originalValues = Object.keys(values);

  it('when not used inside a result template, it gets removed', () => {
    new TestFixture()
      .withElement(generateComponentHTML(resultMultiValueTextComponent))
      .init();

    CommonAssertions.assertRemovesComponent();
  });

  describe('when used inside a result template', () => {
    it('does not error if the field does not exist', () => {
      new TestFixture()
        .with(addMultiValueText({field: 'thisfielddoesnotexist'}))
        .init();

      CommonAssertions.assertConsoleErrorWithoutIt(false);
    });

    it('shows an error when the field value is not a string nor a string array', () => {
      new TestFixture()
        .with(addMultiValueText({field}))
        .with(addFieldValueInResponse(field, 420))
        .init();

      CommonAssertions.assertConsoleErrorWithoutIt();
    });

    it('when the field is an array of 2 values and max-values-to-display is 1, it should truncate', () => {
      new TestFixture()
        .with(
          addMultiValueText({
            field,
            'max-values-to-display': 1,
          })
        )
        .with(addFieldValueInResponse(field, originalValues.slice(0, 2)))
        .withFieldCaptions(field, values)
        .withTranslation({'n-more': '{{value}} more'})
        .init()
        .waitForComponentHydration(resultMultiValueTextComponent);

      assertShouldRenderValues(localizedValues.slice(0, 1));
      assertDisplaysXMoreLabel(1);
      CommonAssertions.assertAccessibilityWithoutIt(
        ResultMultiValueTextSelectors.firstInResult
      );
    });

    it('when the field is an array of 3 values and max-values-to-display is 3, it should not truncate', () => {
      new TestFixture()
        .with(
          addMultiValueText({
            field,
            'max-values-to-display': 3,
          })
        )
        .with(addFieldValueInResponse(field, originalValues))
        .withFieldCaptions(field, values)
        .withTranslation({'n-more': '{{value}} more'})
        .init()
        .waitForComponentHydration(resultMultiValueTextComponent);

      assertShouldRenderValues(localizedValues);
      assertDoesNotDisplayXMoreLabel();
      CommonAssertions.assertAccessibilityWithoutIt(
        ResultMultiValueTextSelectors.firstInResult
      );
    });

    it('when there is a slot it should replace the correct values', () => {
      const slotElement = generateComponentHTML('span', {
        slot: `result-multi-value-text-value-${originalValues[1]}`,
      });
      slotElement.innerText =
        'The field value at position 1 should be replaced by this';

      new TestFixture()
        .with(
          addMultiValueText(
            {
              field,
              'max-values-to-display': 4,
            },
            slotElement
          )
        )
        .with(addFieldValueInResponse(field, originalValues))
        .withFieldCaptions(field, values)
        .withTranslation({'n-more': '{{value}} more'})
        .init()
        .waitForComponentHydration(resultMultiValueTextComponent);

      assertShouldRenderValues([
        localizedValues[0],
        'The field value at position 1 should be replaced by this',
        localizedValues[2],
      ]);
    });

    it('with a facet and two selected values, it should display the selected values first', () => {
      const selectedValues = [originalValues[1], originalValues[2]];
      const facetId = 'blah';

      new TestFixture()
        .with(
          addMultiValueText({
            field,
            'max-values-to-display': 4,
          })
        )
        .with(addFieldValueInResponse(field, originalValues))
        .withFieldCaptions(field, values)
        .withTranslation({'n-more': '{{value}} more'})
        .with((fixture: TestFixture) => {
          fixture
            .with(addFacet({'facet-id': facetId, field}))
            .withCustomResponse((response) => {
              response.facets = [
                {
                  facetId,
                  field,
                  indexScore: 0,
                  moreValuesAvailable: false,
                  values: originalValues.map((v) => ({
                    value: v,
                    numberOfResults: 1337,
                    state: selectedValues.includes(v) ? 'selected' : 'idle',
                  })),
                },
              ];
            });
        })
        .init()
        .waitForComponentHydration(resultMultiValueTextComponent);

      assertShouldRenderValues([
        localizedValues[1],
        localizedValues[2],
        localizedValues[0],
      ]);
    });
  });
});
