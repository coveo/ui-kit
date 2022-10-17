import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  SearchEngine,
  buildFieldSuggestions,
  FieldSuggestions,
  Controller,
  buildFacet,
  Facet,
  FieldSuggestionsValue,
} from '..';

function waitForNextStateChange<T extends Controller>(
  controller: T,
  options: {action?: () => void; expectedSubscriberCalls?: number} = {}
) {
  return new Promise<void>((resolve) => {
    let wasInitialListenerCalled = false;
    let subscriberCalls = 0;
    let unsubscribe = () => {};
    unsubscribe = controller.subscribe(() => {
      if (!wasInitialListenerCalled) {
        wasInitialListenerCalled = true;
        return;
      }
      if (++subscriberCalls < (options?.expectedSubscriberCalls ?? 1)) {
        return;
      }
      unsubscribe();
      resolve();
    });
    options.action?.();
  });
}

describe('field suggestions', () => {
  let engine: SearchEngine;
  const field = 'filetype';
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

    beforeEach(() => {
      facet = buildFacet(engine, {options: {field}});
      fieldSuggestions = buildFieldSuggestions(engine, {
        options: {field, facetId: facet.state.facetId},
      });
    });

    describe('after calling #search', () => {
      beforeEach(async () => {
        await waitForNextStateChange(fieldSuggestions, {
          action: () => fieldSuggestions.search(),
          expectedSubscriberCalls: 2,
        });
      });

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

        it('after calling #search again, ignores the current search context', async () => {
          const initialSuggestions = fieldSuggestions.state.values;
          await waitForNextStateChange(fieldSuggestions, {
            action: () => fieldSuggestions.search(),
            expectedSubscriberCalls: 2,
          });
          expect(fieldSuggestions.state.values).toEqual(initialSuggestions);
        });
      });
    });
  });

  describe('initialized without a facet', () => {
    let fieldSuggestions: FieldSuggestions;
    beforeEach(() => {
      fieldSuggestions = buildFieldSuggestions(engine, {options: {field}});
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
      const valuesThatDontContainQuery = fieldSuggestions.state.values.filter(
        (value) => !value.displayValue.includes(query)
      );
      expect(valuesThatDontContainQuery.length).toEqual(0);
    });

    it('can update captions', async () => {
      const rawValue = 'pdf';
      const displayValue = 'Portable Document Format';
      const query = 'doc';
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
