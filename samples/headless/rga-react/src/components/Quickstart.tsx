import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchEngine,
  type GeneratedAnswerCitation,
  type GeneratedAnswerState,
  getSampleSearchEngineConfiguration,
  type InteractiveCitation,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  type QueryActionCreators,
  type SearchActionCreators,
  type SearchAnalyticsActionCreators,
  type SearchEngine,
  type SearchEngineOptions,
} from '@coveo/headless';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

export const AnswerGenerator = () => {
  const [rgaState, setRgaState] = useState<GeneratedAnswerState | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const engine: SearchEngine = useMemo(() => {
    const searchEngineOptions: SearchEngineOptions = {
      configuration: {
        ...getSampleSearchEngineConfiguration(),
      },
    };

    return buildSearchEngine(searchEngineOptions);
  }, []);

  const {generatedAnswer, updateQuery, logSearchboxSubmit, executeSearch} =
    useMemo(() => {
      const {updateQuery}: QueryActionCreators = loadQueryActions(engine);
      const {
        logInterfaceLoad,
        logSearchboxSubmit,
      }: SearchAnalyticsActionCreators = loadSearchAnalyticsActions(engine);
      const {executeSearch}: SearchActionCreators = loadSearchActions(engine);
      const generatedAnswer = buildGeneratedAnswer(engine);

      engine.dispatch(executeSearch(logInterfaceLoad()));

      return {
        generatedAnswer,
        updateQuery,
        logSearchboxSubmit,
        executeSearch,
      };
    }, [engine]);

  const submit = useCallback(() => {
    engine.dispatch(updateQuery({q: inputRef.current?.value}));
    engine.dispatch(executeSearch(logSearchboxSubmit()));
  }, [engine, updateQuery, logSearchboxSubmit, executeSearch, inputRef]);

  useEffect(() => {
    const unsubscribe = generatedAnswer.subscribe(() =>
      setRgaState(generatedAnswer.state)
    );
    return unsubscribe;
  }, [generatedAnswer, setRgaState]);

  return (
    <>
      {rgaState?.isLoading && <div>Loading...</div>}
      <input
        type="text"
        defaultValue={''}
        id="searchInput"
        ref={inputRef}
        disabled={rgaState?.isLoading}
      />
      <button type="button" onClick={submit}>
        Submit
      </button>

      {!rgaState?.isLoading && Boolean(rgaState?.answer) && (
        <div>
          <span className={`${rgaState?.isStreaming && 'rga-typing'} rga-text`}>
            {rgaState?.answer}
          </span>
          {!rgaState?.isStreaming && (
            <CitationsList
              citations={rgaState?.citations}
              searchEngine={engine}
              isStreaming={Boolean(rgaState?.isStreaming)}
            />
          )}
        </div>
      )}
    </>
  );
};

type TCitationsList = {
  citations?: GeneratedAnswerState['citations'];
  isStreaming: GeneratedAnswerState['isStreaming'];
  searchEngine: SearchEngine;
};

const CitationsList = ({
  citations,
  isStreaming,
  searchEngine,
}: TCitationsList) => {
  if (!citations || isStreaming) return;

  return (
    <div>
      {citations.map((citation: GeneratedAnswerCitation) => (
        <Citation
          key={citation.id}
          citation={citation}
          searchEngine={searchEngine}
        />
      ))}
    </div>
  );
};

type TCitation = {
  citation: GeneratedAnswerCitation;
  searchEngine: SearchEngine;
};

const Citation = ({citation, searchEngine}: TCitation) => {
  const interactiveCitation: InteractiveCitation = buildInteractiveCitation(
    searchEngine,
    {
      options: {
        citation,
      },
    }
  ); // callout[Refer to <a href="#citations-list">Citations List</a> for more additional details.]

  return (
    <button
      type="button"
      onClick={() => interactiveCitation.select()}
      onTouchEnd={() => interactiveCitation.cancelPendingSelect()}
      onTouchStart={() => interactiveCitation.beginDelayedSelect()}
    >
      {citation.title}
    </button>
  );
};
