import {PlatformClient} from '../../api/platform-client';
import {MockSearchEngine} from '../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {buildMockFieldDescription} from '../../test/mock-field-description';
import {createMockState} from '../../test/mock-state';
import {
  disableFetchAllFields,
  enableFetchAllFields,
  fetchFieldsDescription,
  registerFieldsToInclude,
} from './fields-actions';
import {fieldsReducer} from './fields-slice';
import {FieldsState, getFieldsInitialState} from './fields-state';

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
    let e: MockSearchEngine;

    beforeEach(() => {
      e = buildMockSearchAppEngine({state: createMockState()});
      PlatformClient.call = jest.fn().mockImplementation(() => {
        const body = JSON.stringify([
          buildMockFieldDescription(),
          buildMockFieldDescription(),
        ]);
        const response = new Response(body);

        return Promise.resolve(response);
      });
    });

    it('calls platform client to get fields description', async () => {
      await e.dispatch(fetchFieldsDescription());
      expect(PlatformClient.call).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/fields'),
          method: 'GET',
        })
      );
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
