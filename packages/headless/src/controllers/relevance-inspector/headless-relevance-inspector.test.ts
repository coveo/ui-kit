import {
  buildRelevanceInspector,
  RelevanceInspector,
  RelevanceInspectorProps,
} from './headless-relevance-inspector';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {disableDebug, enableDebug} from '../../features/debug/debug-actions';
import {createMockState} from '../../test';
import {buildMockSearchResponseWithDebugInfo} from '../../test/mock-search-response';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {configuration, debug, search} from '../../app/reducers';

describe('RelevanceInspector', () => {
  let engine: MockSearchEngine;
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

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      debug,
      search,
      configuration,
    });
  });

  it('when enabling debug, should call the listener', () => {
    const listenerSpy = jest.fn();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.enable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when enabling debug twice, should call the listener once', () => {
    const listenerSpy = jest.fn();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.enable();
    relevanceInspector.enable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when disabling, should call the listener', () => {
    const listenerSpy = jest.fn();
    relevanceInspector.enable();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.disable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('when disabling twice, should call the listener once', () => {
    const listenerSpy = jest.fn();
    relevanceInspector.enable();
    relevanceInspector.subscribe(listenerSpy);
    relevanceInspector.disable();
    relevanceInspector.disable();
    expect(listenerSpy).toHaveBeenCalledTimes(1);
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
