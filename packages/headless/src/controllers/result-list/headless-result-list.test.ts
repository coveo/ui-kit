import {buildResultList} from './headless-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../..';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';

describe('ResultList', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('initializes correctly with no fields to include', () => {
    expect(buildResultList(engine)).toBeTruthy();
    expect(engine.actions).not.toContainEqual(registerFieldsToInclude([]));
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
