import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '../app/search-engine/search-engine.js';
import {
  buildFacet,
  type Facet,
} from '../controllers/facets/facet/headless-facet.js';
import {
  buildFieldSuggestions,
  type FieldSuggestions,
  type FieldSuggestionsValue,
} from '../controllers/field-suggestions/facet/headless-field-suggestions.js';
import {waitForNextStateChange} from '../test/functional-test-utils.js';

describe('field suggestions', () => {
  let engine: SearchEngine;
  const field = 'filetype';
  const facetField = 'author';
  beforeEach(() => {
    engine = buildSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
        analytics: {enabled: false},
      },
      loggerOptions: {level: 'silent'},
    });
  });

  describe('with a matching facet', () => {
    let facet: Facet;
    let fieldSuggestions: FieldSuggestions;

    function getSelectedValues() {
      return facet.state.values
        .filter((value) => value.state === 'selected')
        .map(({value}) => value);
    }

    beforeEach(async () => {
      await waitForNextStateChange(engine, {
        action: () => {
          facet = buildFacet(engine, {options: {field}});
        },
        expectedSubscriberCalls: 4,
      });
      await waitForNextStateChange(engine, {
        action: () => {
          fieldSuggestions = buildFieldSuggestions(engine, {
            options: {facet: {field, facetId: facet.state.facetId}},
          });
        },
        expectedSubscriberCalls: 2,
      });
    });

    describe('after calling #search', () => {
      beforeEach(async () => {
        await waitForNextStateChange(fieldSuggestions, {
          action: () => fieldSuggestions.search(),
          expectedSubscriberCalls: 2,
        });
      }, 30e3);

      it('can single select facet values', async () => {
        const firstToggledValue = fieldSuggestions.state.values[0];
        const secondToggledValue = fieldSuggestions.state.values[1];
        await waitForNextStateChange(facet, {
          action: () => fieldSuggestions.singleSelect(firstToggledValue),
          expectedSubscriberCalls: 2,
        });
        expect(getSelectedValues()).toEqual([firstToggledValue.displayValue]);
        await waitForNextStateChange(facet, {
          action: () => fieldSuggestions.singleSelect(secondToggledValue),
          expectedSubscriberCalls: 2,
        });
        expect(getSelectedValues()).toEqual([secondToggledValue.displayValue]);
      });

      describe('after selecting multiple facet values', () => {
        let valuesToSelect: FieldSuggestionsValue[];
        beforeEach(async () => {
          const numberOfValuesToSelect = 2;
          valuesToSelect = fieldSuggestions.state.values.slice(
            0,
            numberOfValuesToSelect
          );
          for (const value of valuesToSelect) {
            await waitForNextStateChange(facet, {
              action: () => fieldSuggestions.select(value),
              expectedSubscriberCalls: 2,
            });
          }
        });

        it('can select multiple facet value', async () => {
          const expectedValues = valuesToSelect.map(
            ({displayValue}) => displayValue
          );
          expect(getSelectedValues()).toEqual(expectedValues);
        });
      });
    });
  });

  describe('initialized without a facet', () => {
    let fieldSuggestions: FieldSuggestions;

    beforeEach(async () => {
      fieldSuggestions = buildFieldSuggestions(engine, {
        options: {facet: {field}},
      });
      await waitForNextStateChange(engine, {
        action: () => {},
        expectedSubscriberCalls: 3,
      });
    });

    it('has the correct initial state', () => {
      expect(fieldSuggestions.state).toEqual({
        isLoading: false,
        values: [],
        query: '',
        moreValuesAvailable: false,
      });
    });

    describe('after calling #search', () => {
      beforeEach(async () => {
        await waitForNextStateChange(fieldSuggestions, {
          action: () => fieldSuggestions.search(),
          expectedSubscriberCalls: 2,
        });
      });

      afterEach(() => {
        vi.clearAllMocks();
      });

      it('has more values', () => {
        expect(fieldSuggestions.state.values.length).toBeGreaterThan(0);
      });

      it('can fetch more values', async () => {
        expect(fieldSuggestions.state.moreValuesAvailable).toBeTruthy();
        const numberOfValues = fieldSuggestions.state.values.length;
        await waitForNextStateChange(fieldSuggestions, {
          action: () => fieldSuggestions.showMoreResults(),
          expectedSubscriberCalls: 2,
        });
        expect(fieldSuggestions.state.values.length).toBeGreaterThan(
          numberOfValues
        );
      });
    });

    it('is unaffected by the current search context', async () => {
      let facet!: Facet;
      await waitForNextStateChange(engine, {
        action: () => {
          facet = buildFacet(engine, {options: {field: facetField}});
        },
        expectedSubscriberCalls: 3,
      });
      await waitForNextStateChange(facet, {
        action: () => engine.executeFirstSearch(),
        expectedSubscriberCalls: 2,
      });
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.search(),
        expectedSubscriberCalls: 2,
      });
      const initialSuggestions = fieldSuggestions.state.values;
      await waitForNextStateChange(facet, {
        action: () => facet.toggleSelect(facet.state.values[0]),
        expectedSubscriberCalls: 2,
      });
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.search(),
        expectedSubscriberCalls: 2,
      });
      expect(fieldSuggestions.state.values).toEqual(initialSuggestions);
    });

    it('set isLoading when calling #search', async () => {
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.search(),
      });
      expect(fieldSuggestions.state.isLoading).toBeTruthy();
      await waitForNextStateChange(fieldSuggestions);
      expect(fieldSuggestions.state.isLoading).toBeFalsy();
    });

    it('can search with a query', async () => {
      const query = 'doc';
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      expect(fieldSuggestions.state.query).toEqual(query);
      expect(fieldSuggestions.state.values.length).toBeGreaterThan(0);
      const valuesThatDoNotContainQuery = fieldSuggestions.state.values.filter(
        (value) => !value.displayValue.includes(query)
      );
      expect(valuesThatDoNotContainQuery.length).toEqual(0);
    });

    it('can update captions', async () => {
      const rawValue = 'lithiumboard';
      const displayValue = 'Message board';
      const query = 'mess';
      fieldSuggestions.updateCaptions({[rawValue]: displayValue});
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      expect(
        fieldSuggestions.state.values.find(
          (value) => value.rawValue === rawValue
        )?.displayValue
      ).toEqual(displayValue);
    });

    it('can clear the search', async () => {
      const query = 'doc';
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      await waitForNextStateChange(fieldSuggestions, {
        action: () => fieldSuggestions.clear(),
      });
      expect(fieldSuggestions.state.query).toEqual('');
      expect(fieldSuggestions.state.values.length).toEqual(0);
    });
  });
});
