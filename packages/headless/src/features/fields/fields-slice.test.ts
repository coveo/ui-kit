import {fieldsReducer} from './fields-slice';
import {
  debugFields,
  fetchFieldsDescription,
  registerFieldsToInclude,
} from './fields-actions';
import {FieldsState, getFieldsInitialState} from './fields-state';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../test';
import {PlatformClient} from '../../api/platform-client';
import {buildMockFieldDescription} from '../../test/mock-field-description';

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

  it('should add debug fields if requested', () => {
    expect(
      fieldsReducer(getFieldsInitialState(), debugFields(true)).debugFields
    ).toBe(true);
  });

  it('should remove debug fields if requested', () => {
    expect(
      fieldsReducer(getFieldsInitialState(), debugFields(false)).debugFields
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
