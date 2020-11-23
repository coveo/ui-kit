import {buildResultList} from './headless-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';

describe('ResultList', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('initializes correctly with no fields to include', () => {
    expect(buildResultList(engine)).toBeTruthy();
    const action = engine.actions.find(
      (a) => a.type === registerFieldsToInclude.type
    );
    expect(action).toBeUndefined();
  });

  it('initializes correctly with fields to include', () => {
    expect(
      buildResultList(engine, {
        options: {fieldsToInclude: ['test']},
      })
    ).toBeTruthy();
    expect(engine.actions).toContainEqual(registerFieldsToInclude(['test']));
  });
});
