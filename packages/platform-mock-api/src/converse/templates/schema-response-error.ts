import {RunError, RunStarted, TurnStarted, toolCall, type ConverseEvent} from '../events.js';

// A failed turn ends on RUN_ERROR, with no RUN_FINISHED and no turn_complete.
function failedTurn(runId: string, runError: ConverseEvent): ConverseEvent[] {
  return [
    TurnStarted(),
    RunStarted({runId}),
    ...toolCall({
      toolCallId: 'tc-search-failed-turn',
      toolCallName: 'coveo_commerce_search',
      parentMessageId: 'msg-failed-turn',
      args: {query: 'kayak'},
      resultMessageId: 'tc-search-failed-turn-result',
      resultContent: '"Search started."',
    }),
    {...runError, delayMs: 1200},
  ];
}

// The agent fails and says so: its progress block ends `error` first.
const schemaAgentErrorEvents: ConverseEvent[] = failedTurn(
  'schema-agent-error-5d1c2e7a',
  RunError({message: 'The agent could not finish its answer.'})
);

// The gateway ends the turn itself, so the progress block is still running when RUN_ERROR arrives.
const schemaGatewayTimeoutEvents: ConverseEvent[] = failedTurn(
  'schema-gateway-timeout-9b3f04c6',
  RunError({message: 'The agent took too long to answer.', code: 'AGENT:UPSTREAM_TIMEOUT'})
);

export {schemaAgentErrorEvents, schemaGatewayTimeoutEvents};
