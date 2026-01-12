/* components/AnswerGenerator.tsx */

import {
  type GeneratedAnswerState,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  type QueryActionCreators,
  type SearchActionCreators,
  type SearchAnalyticsActionCreators,
} from '@coveo/headless';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {answerGenerator, headlessEngine} from '../lib/engines.js';

export const AnswerGenerator = () => {
  const [rgaState, setRgaState] = useState<GeneratedAnswerState>(); // callout[Create a state variable to store the response from the RGA instance.]
  const inputRef = useRef<HTMLInputElement>(null);

  const {updateQuery, executeSearch, logSearchboxSubmit, rgaController} =
    useMemo(() => {
      const rgaController = answerGenerator();
      const {updateQuery}: QueryActionCreators =
        loadQueryActions(headlessEngine); // callout[Refer to <a href="https://docs.coveo.com/en/headless/latest/reference/functions/Search.loadQueryActions.html>`loadQueryActions`</a> for additional details.]
      const {executeSearch}: SearchActionCreators =
        loadSearchActions(headlessEngine); // callout[Refer to <a href="https://docs.coveo.com/en/headless/latest/reference/functions/Search.loadSearchActions.html">`loadSearchActions`</a> for additional details.]
      const {logSearchboxSubmit}: SearchAnalyticsActionCreators =
        loadSearchAnalyticsActions(headlessEngine); // callout[Refer to <a href="https://docs.coveo.com/en/headless/latest/reference/functions/Search.loadSearchAnalyticsActions.html">`loadSearchAnalyticsActions`</a> for additional details.]
      return {
        rgaController,
        updateQuery,
        executeSearch,
        logSearchboxSubmit,
      };
    }, [headlessEngine]); // callout[Only instantiate new action creators if the engine has changed.]

  const submitQuestion = useCallback(() => {
    headlessEngine.dispatch(updateQuery({q: inputRef.current?.value}));
    headlessEngine.dispatch(executeSearch(logSearchboxSubmit())); // callout[Dispatch the action to submit your request for processing.]
  }, [updateQuery, executeSearch, logSearchboxSubmit]); // callout[Create an action to submit your question.]

  useEffect(() => {
    const unsubscribe = rgaController.subscribe(() =>
      setRgaState(rgaController.state)
    );
    return unsubscribe; // callout[Unsubscribe from the controller’s state updates when the component unmounts to prevent memory leaks and duplicate subscriptions.]
  }, [setRgaState, rgaController]); //callout[Subscribe to state updates from the `GeneratedAnswer` controller when the component mounts.]

  return (
    <>
      <input
        type="text"
        defaultValue={''}
        id="searchInput"
        ref={inputRef}
        disabled={rgaState?.isLoading}
      />
      <button type="button" onClick={submitQuestion}>
        Submit
      </button>
      {rgaState?.isLoading && <div>Loading...</div>}
      <div>{rgaState?.answer}</div>
    </>
  );
};
