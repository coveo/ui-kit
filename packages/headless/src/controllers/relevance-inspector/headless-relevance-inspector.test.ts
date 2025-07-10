import {configuration} from '../../app/common-reducers.js';
import {disableDebug, enableDebug} from '../../features/debug/debug-actions.js';
import {rankingInformationSelector} from '../../features/debug/debug-selectors.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import {
  disableFetchAllFields,
  enableFetchAllFields,
  fetchFieldsDescription,
} from '../../features/fields/fields-actions.js';
import {fieldsReducer as fields} from '../../features/fields/fields-slice.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockFieldDescription} from '../../test/mock-field-description.js';
import {buildMockSearchResponseWithDebugInfo} from '../../test/mock-search-response.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildRelevanceInspector,
  type RelevanceInspector,
  type RelevanceInspectorProps,
} from './headless-relevance-inspector.js';

vi.mock('../../features/debug/debug-actions');
vi.mock('../../features/fields/fields-actions');

describe('RelevanceInspector', () => {
  let engine: MockedSearchEngine;
  let relevanceInspector: RelevanceInspector;

  beforeEach(() => {
    initRelevanceInspector();
  });

  function initRelevanceInspector(props?: RelevanceInspectorProps) {
    engine = buildMockSearchEngine(createMockState());
    relevanceInspector = buildRelevanceInspector(engine, props);
  }

  it('initializes correctly', () => {
    expect(buildRelevanceInspector(engine)).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      debug,
      search,
      configuration,
      fields,
    });
  });

  it('when enabling debug, should call the listener', () => {
    const listenerSpy = vi.fn();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.enable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when enabling debug twice, should call the listener once', () => {
    const listenerSpy = vi.fn();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.enable();
    relevanceInspector.enable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when disabling, should call the listener', () => {
    const listenerSpy = vi.fn();
    relevanceInspector.enable();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.disable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when disabling twice, should call the listener once', () => {
    const listenerSpy = vi.fn();
    relevanceInspector.enable();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.disable();
    relevanceInspector.disable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it(`when initialized with enabled="true"
  it should dispatch an "enableDebug" action`, () => {
    initRelevanceInspector({initialState: {enabled: true}});
    expect(enableDebug).toHaveBeenCalled();
  });

  it(`when calling enable()
  it should dispatch an "enableDebug" action`, () => {
    relevanceInspector.enable();
    expect(enableDebug).toHaveBeenCalled();
  });

  it(`when calling disable()
  it should dispatch an "disableDebug" action`, () => {
    relevanceInspector.disable();
    expect(disableDebug).toHaveBeenCalled();
  });

  it(`when calling enableFieldsDebug()
  it should dispatch an "enableFieldsDebug" action`, () => {
    relevanceInspector.enableFetchAllFields();
    expect(enableFetchAllFields).toHaveBeenCalled();
  });

  it(`when calling disableFieldsDebug()
  it should dispatch an "disableFieldsDebug" action`, () => {
    relevanceInspector.disableFetchAllFields();
    expect(disableFetchAllFields).toHaveBeenCalled();
  });

  it(`when calling fetchFieldsDescription() with debug disabled
  it should dispatch an "enableDebug" action`, () => {
    relevanceInspector.fetchFieldsDescription();
    expect(enableDebug).toHaveBeenCalled();
  });

  it(`when calling fetchFieldsDescription() 
  it should dispatch an "fetchFieldsDescription" action`, () => {
    relevanceInspector.fetchFieldsDescription();
    expect(fetchFieldsDescription).toHaveBeenCalled();
  });

  it('should return the right state when its disabled', () => {
    expect(relevanceInspector.state).toEqual({isEnabled: false});
  });

  it('should return the right state when its enabled', () => {
    const responseWithDebug = buildMockSearchResponseWithDebugInfo();
    const state = createMockState();
    state.debug = true;
    state.search.response = responseWithDebug;
    engine = buildMockSearchEngine(state);
    relevanceInspector = buildRelevanceInspector(engine);

    expect(relevanceInspector.state).toEqual({
      isEnabled: true,
      rankingInformation: rankingInformationSelector(engine.state),
      executionReport: responseWithDebug.executionReport,
      expressions: {
        basicExpression: responseWithDebug.basicExpression,
        advancedExpression: responseWithDebug.advancedExpression,
        constantExpression: responseWithDebug.constantExpression,
      },
      fetchAllFields: false,
      userIdentities: responseWithDebug.userIdentities,
      rankingExpressions: responseWithDebug.rankingExpressions,
      fieldsDescription: [],
    });
  });

  it('should return the fieldsDescription correctly, when debug is enabled', () => {
    const state = createMockState();
    state.debug = true;
    state.fields.fieldsDescription = [buildMockFieldDescription()];
    engine = buildMockSearchEngine(state);
    relevanceInspector = buildRelevanceInspector(engine);

    expect(relevanceInspector.state).toMatchObject({
      fieldsDescription: state.fields.fieldsDescription,
    });
  });
});
