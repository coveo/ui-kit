import {
  buildRelevanceInspector,
  RelevanceInspector,
  RelevanceInspectorProps,
} from './headless-relevance-inspector';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {disableDebug, enableDebug} from '../../features/debug/debug-actions';
import {createMockState} from '../../test';
import {buildMockSearchResponseWithDebugInfo} from '../../test/mock-search-response';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';

describe('RelevanceInspector', () => {
  let engine: MockEngine<SearchAppState>;
  let relevanceInspector: RelevanceInspector;

  beforeEach(() => {
    initRelevanceInspector();
  });

  function initRelevanceInspector(props?: RelevanceInspectorProps) {
    engine = buildMockSearchAppEngine();
    relevanceInspector = buildRelevanceInspector(engine, props);
  }

  it('initializes correctly', () => {
    expect(buildRelevanceInspector(engine)).toBeTruthy();
  });

  it(`when initialized with enabled="true"
  it should dispatch an "enableDebug" action`, () => {
    initRelevanceInspector({initialState: {enabled: true}});
    expect(engine.actions).toContainEqual(enableDebug());
  });

  it(`when calling enable()
  it should dispatch an "enableDebug" action`, () => {
    relevanceInspector.enable();
    expect(engine.actions).toContainEqual(enableDebug());
  });

  it(`when calling disable()
  it should dispatch an "disableDebug" action`, () => {
    relevanceInspector.disable();
    expect(engine.actions).toContainEqual(disableDebug());
  });

  it('should return the right state when its disabled', () => {
    expect(relevanceInspector.state).toEqual({isEnabled: false});
  });

  it('should return the right state when its enabled', () => {
    const responseWithDebug = buildMockSearchResponseWithDebugInfo();
    const state = createMockState();
    state.debug = true;
    state.search.response = responseWithDebug;
    engine = buildMockSearchAppEngine({state});
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
      userIdentities: responseWithDebug.userIdentities,
      rankingExpressions: responseWithDebug.rankingExpressions,
    });
  });
});
