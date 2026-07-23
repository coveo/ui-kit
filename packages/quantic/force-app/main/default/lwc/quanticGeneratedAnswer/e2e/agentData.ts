type AgentRunType = {
  type: 'RUN_STARTED' | 'RUN_FINISHED';
  timestamp: number;
  threadId: string;
  runId: string;
  result?: {
    completionReason: string;
  };
};

type AgentCustomType = {
  type: 'CUSTOM';
  timestamp: number;
  name: string;
  value: any;
};

type AgentStepType = {
  type: 'STEP_STARTED' | 'STEP_FINISHED';
  timestamp: number;
  stepName: string;
};

type AgentToolCallType = {
  type: 'TOOL_CALL_START' | 'TOOL_CALL_END';
  timestamp: number;
  toolCallId: string;
  toolCallName: string;
  parentMessageId: string;
};

type AgentToolCallArgsType = {
  type: 'TOOL_CALL_ARGS';
  timestamp: number;
  toolCallId: string;
  delta: any;
};

type AgentTextMessageType = {
  type: 'TEXT_MESSAGE_CHUNK';
  timestamp: number;
  messageId: string;
  parentMessageId: string;
  delta: string;
};

export type AgentCitation = {
  id: string;
  title: string;
  uri: string;
  permanentid: string;
  primaryId: string;
  clickUri: string;
  text: string;
  source: string;
  filetype: string;
  fields: Record<string, any>;
};

type AgentCitationType = {
  type: 'CUSTOM';
  timestamp: number;
  name: 'citations';
  value: {
    citations: Array<AgentCitation>;
  };
};

type AgentRunErrorType = {
  type: 'RUN_ERROR';
  timestamp: number;
  message: string;
  code: string;
};

const STREAM_ID = 'conv_1';
const ANSWER_ID_1 = 'conv_1_0001';
const ANSWER_ID_2 = 'conv_1_0002';
const ANSWER_ID_3 = 'conv_1_0003';
const CONVERSATION_TOKEN = 'conv_1_token';

const runStartStream = (answerId: string): AgentRunType => ({
  type: 'RUN_STARTED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: answerId,
});

const customInitialHeadersStream = (followUpEnabled: boolean): AgentCustomType => ({
  type: 'CUSTOM',
  timestamp: new Date().valueOf(),
  name: 'header',
  value: {
    contentFormat: 'text/markdown',
    conversationId: STREAM_ID,
    followUpEnabled,
    conversationToken: CONVERSATION_TOKEN,
  },
});

const stepStartedStream = (stepName: string): AgentStepType => ({
  type: 'STEP_STARTED',
  timestamp: new Date().valueOf(),
  stepName,
});

const stepFinishedStream = (stepName: string): AgentStepType => ({
  type: 'STEP_FINISHED',
  timestamp: new Date().valueOf(),
  stepName,
});

const toolCallStartStream = (toolCallName: string): AgentToolCallType => ({
  type: 'TOOL_CALL_START',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  toolCallName,
  parentMessageId: 'message_1',
});

const searchQueryToolCallArgsStream = (q: string): AgentToolCallArgsType => ({
  type: 'TOOL_CALL_ARGS',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  delta: JSON.stringify({
    q,
  }),
});

const toolCallEndStream = (toolCallName: string): AgentToolCallType => ({
  type: 'TOOL_CALL_END',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  toolCallName,
  parentMessageId: 'message_1',
});

const textMessageStream = (delta: string): AgentTextMessageType => ({
  type: 'TEXT_MESSAGE_CHUNK',
  timestamp: new Date().valueOf(),
  messageId: 'message_2',
  parentMessageId: 'message_1',
  delta,
});

const exampleCitation: AgentCitation = {
  id: 'some-id-1',
  title: 'Some Title 1',
  uri: 'https://www.coveo.com',
  permanentid: 'some-permanent-id-1',
  clickUri: 'https://www.coveo.com',
  text: 'example text 1',
  source: 'Some source 1',
  filetype: 'pdf',
  fields: {},
  primaryId: 'primary-id-1',
};

const citationStream: AgentCitationType = {
  type: 'CUSTOM',
  timestamp: new Date().valueOf(),
  name: 'citations',
  value: {
    citations: [exampleCitation],
  },
};

const runFinishedStream = (answerId: string): AgentRunType => ({
  type: 'RUN_FINISHED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: answerId,
  result: {
    completionReason: 'ANSWERED',
  },
});

const runErrorStream = (
  message: string,
  code: string
): AgentRunErrorType => ({
  type: 'RUN_ERROR',
  timestamp: new Date().valueOf(),
  message,
  code,
});

export type AgentMessage =
  | AgentRunType
  | AgentCustomType
  | AgentStepType
  | AgentToolCallType
  | AgentToolCallArgsType
  | AgentTextMessageType
  | AgentCitationType
  | AgentRunErrorType;

/**
 * SSE error stream simulating the turn limit being reached on a follow-up request.
 * The strategy sets the active answer id from RUN_STARTED before the error is dispatched.
 */
export const turnLimitErrorStream: Array<AgentMessage> = [
  runStartStream(ANSWER_ID_2),
  runErrorStream(
    'The conversation turn limit has been reached.',
    'KNOWLEDGE:SSE_TURN_LIMIT_REACHED'
  ),
];

/**
 * SSE error stream simulating a generic/internal error on a follow-up request.
 */
export const genericErrorStream: Array<AgentMessage> = [
  runStartStream(ANSWER_ID_2),
  runErrorStream('An unexpected error occurred.', 'KNOWLEDGE:SSE_INTERNAL_ERROR'),
];

export type AgentData = {
  answerStreams: Array<AgentMessage>;
  followUpStreams: Array<Array<AgentMessage>>;
  conversationId: string;
  answerId1: string;
  answerId2: string;
  answerId3: string;
  conversationToken: string;
  citations: Array<AgentCitation>;
};

const agentData: AgentData = {
  answerStreams: [
    runStartStream(ANSWER_ID_1),
    customInitialHeadersStream(true),
    stepStartedStream('Searching'),
    toolCallStartStream('search'),
    searchQueryToolCallArgsStream('test'),
    toolCallEndStream('search'),
    stepFinishedStream('Searching'),
    stepStartedStream('Answering'),
    textMessageStream('### Testing in Coveo\n\nclick **Edit components**.\n   - On the **A/B test** tab, click **Configure A/B test**.\n   - Set the traffic ratio and configure the **Test scenario**.\n   - Click **Start** to activate the A/B test.\n\n2. **Edit an A/B Test**\n   - Follow the same steps as creating an A/B test.\n   - Click **Edit A/B test** and adjust the traffic ratio.'),
    citationStream,
    stepFinishedStream('Answering'),
    runFinishedStream(ANSWER_ID_1),
  ],
  followUpStreams: [
    [
      runStartStream(ANSWER_ID_2),
      customInitialHeadersStream(true),
      stepStartedStream('Thinking'),
      stepFinishedStream('Thinking'),
      stepStartedStream('Searching'),
      toolCallStartStream('search'),
      searchQueryToolCallArgsStream('follow-up question'),
      toolCallEndStream('search'),
      stepFinishedStream('Searching'),
      stepStartedStream('Answering'),
      textMessageStream('This is a follow-up answer.'),
      citationStream,
      stepFinishedStream('Answering'),
      runFinishedStream(ANSWER_ID_2),
    ],
    [
      runStartStream(ANSWER_ID_3),
      customInitialHeadersStream(true),
      stepStartedStream('Thinking'),
      stepFinishedStream('Thinking'),
      stepStartedStream('Searching'),
      toolCallStartStream('search'),
      searchQueryToolCallArgsStream('third question'),
      toolCallEndStream('search'),
      stepFinishedStream('Searching'),
      stepStartedStream('Answering'),
      textMessageStream('This is the third answer.'),
      citationStream,
      stepFinishedStream('Answering'),
      runFinishedStream(ANSWER_ID_3),
    ],
  ],
  conversationId: STREAM_ID,
  answerId1: ANSWER_ID_1,
  answerId2: ANSWER_ID_2,
  answerId3: ANSWER_ID_3,
  conversationToken: CONVERSATION_TOKEN,
  citations: [exampleCitation],
};

export default agentData;
