import type {SearchAPIClient} from '../../api/search/search-api-client.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockFieldDescription} from '../../test/mock-field-description.js';
import {createMockState} from '../../test/mock-state.js';
import {
  disableFetchAllFields,
  enableFetchAllFields,
  fetchFieldsDescription,
  registerFieldsToInclude,
} from './fields-actions.js';
import {fieldsReducer} from './fields-slice.js';
import {type FieldsState, getFieldsInitialState} from './fields-state.js';

describe('fields slice', () => {
  it('should have initial state', () => {
    expect(fieldsReducer(undefined, {type: 'randomAction'})).toEqual(
      getFieldsInitialState()
    );
  });

  it('should handle registerFieldsToInclude on initial state', () => {
    const expectedState: FieldsState = {
      ...getFieldsInitialState(),
      fieldsToInclude: [
        ...getFieldsInitialState().fieldsToInclude,
        'field1',
        'field2',
      ],
    };

    const action = registerFieldsToInclude(['field1', 'field2']);
    expect(fieldsReducer(undefined, action)).toEqual(expectedState);
  });

  it('should not have duplicate fields', () => {
    const action = registerFieldsToInclude(['author', 'language']);
    expect(fieldsReducer(undefined, action)).toEqual(getFieldsInitialState());
  });

  it('should fetch all fields if requested', () => {
    expect(
      fieldsReducer(getFieldsInitialState(), enableFetchAllFields())
        .fetchAllFields
    ).toBe(true);
  });

  it('should not fetch all fields if requested', () => {
    expect(
      fieldsReducer(getFieldsInitialState(), disableFetchAllFields())
        .fetchAllFields
    ).toBe(false);
  });

  describe('when fetching fields description', () => {
    let e: MockedSearchEngine;
    let apiClient: SearchAPIClient;

    beforeEach(() => {
      e = buildMockSearchEngine(createMockState());
      apiClient = {
        fieldDescriptions: vi.fn(),
      } as unknown as SearchAPIClient;
    });

    it('calls platform client to get fields description', async () => {
      await fetchFieldsDescription()(e.dispatch, () => e.state, {
        apiClient,
      } as ClientThunkExtraArguments<SearchAPIClient>);

      expect(apiClient.fieldDescriptions).toHaveBeenCalled();
    });

    it('should add fields description to the state', () => {
      const action = fetchFieldsDescription.fulfilled(
        [buildMockFieldDescription(), buildMockFieldDescription()],
        ''
      );
      expect(
        fieldsReducer(getFieldsInitialState(), action).fieldsDescription.length
      ).toBe(2);
    });
  });
});
