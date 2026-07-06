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
  value: string;
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
  delta: string;
};

type AgentTextMessageType = {
  type: 'TEXT_MESSAGE_CHUNK';
  timestamp: number;
  messageId: string;
  parentMessageId: string;
  delta: string;
};

type AgentCitationType = {
  type: 'CUSTOM';
  timestamp: number;
  name: 'citations';
  value: {
    citations: Array<AgentCitation>;
  };
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

const STREAM_ID = 'conv_1';
const ANSWER_ID_1 = 'conv_1_0001';
const ANSWER_ID_2 = 'conv_1_0002';
const CONVERSATION_TOKEN = 'conv_1_token';

const runStartStream: AgentRunType = {
  type: 'RUN_STARTED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: ANSWER_ID_1,
};

const customHeaderWithFollowUpStream: AgentCustomType = {
  type: 'CUSTOM',
  timestamp: new Date().valueOf(),
  name: 'header',
  value: JSON.stringify({
    contentFormat: 'text/markdown',
    conversationId: STREAM_ID,
    followUpEnabled: true,
    conversationToken: CONVERSATION_TOKEN,
  }),
};

const searchStepStartedStream: AgentStepType = {
  type: 'STEP_STARTED',
  timestamp: new Date().valueOf(),
  stepName: 'Searching',
};

const searchToolCallStartStream: AgentToolCallType = {
  type: 'TOOL_CALL_START',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  toolCallName: 'search',
  parentMessageId: 'message_1',
};

const searchQueryToolCallArgsStream: AgentToolCallArgsType = {
  type: 'TOOL_CALL_ARGS',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  delta: JSON.stringify({
    q: 'test',
  }),
};

const searchToolCallEndStream: AgentToolCallType = {
  type: 'TOOL_CALL_END',
  timestamp: new Date().valueOf(),
  toolCallId: 'tool_call_1',
  toolCallName: 'search',
  parentMessageId: 'message_1',
};

const searchStepFinishedStream: AgentStepType = {
  type: 'STEP_FINISHED',
  timestamp: new Date().valueOf(),
  stepName: 'Searching',
};

const answeringStepStartedStream: AgentStepType = {
  type: 'STEP_STARTED',
  timestamp: new Date().valueOf(),
  stepName: 'Answering',
};

const textMessageStream: AgentTextMessageType = {
  type: 'TEXT_MESSAGE_CHUNK',
  timestamp: new Date().valueOf(),
  messageId: 'message_1',
  parentMessageId: 'message_0',
  delta: '### Testing in Coveo\n\nclick **Edit components**.\n   - On the **A/B test** tab, click **Configure A/B test**.\n   - Set the traffic ratio and configure the **Test scenario**.\n   - Click **Start** to activate the A/B test.\n\n2. **Edit an A/B Test**\n   - Follow the same steps as creating an A/B test.\n   - Click **Edit A/B test** and adjust the traffic ratio.',
};

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
  primaryId: "primary-id-1"
};

const citationStream: AgentCitationType = {
  type: 'CUSTOM',
  timestamp: new Date().valueOf(),
  name: 'citations',
  value: {
    citations: [exampleCitation],
  },
};

const answeringStepFinishedStream: AgentStepType = {
  type: 'STEP_FINISHED',
  timestamp: new Date().valueOf(),
  stepName: 'Answering',
};

const runFinishedStream: AgentRunType = {
  type: 'RUN_FINISHED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: ANSWER_ID_1,
  result: {
    completionReason: 'COMPLETED',
  },
};

const followUpRunStartStream: AgentRunType = {
  type: 'RUN_STARTED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: ANSWER_ID_2,
};

const followUpCustomHeaderWithFollowUpStream: AgentCustomType = {
  type: 'CUSTOM',
  timestamp: new Date().valueOf(),
  name: 'header',
  value: JSON.stringify({
    contentFormat: 'text/markdown',
    conversationId: STREAM_ID,
    followUpEnabled: true,
  }),
};

const followUpThinkingStepStartedStream: AgentStepType = {
  type: 'STEP_STARTED',
  timestamp: new Date().valueOf(),
  stepName: 'Thinking',
};

const followUpThinkingStepFinishedStream: AgentStepType = {
  type: 'STEP_FINISHED',
  timestamp: new Date().valueOf(),
  stepName: 'Thinking',
};

const followUpAnsweringStepStartedStream: AgentStepType = {
  type: 'STEP_STARTED',
  timestamp: new Date().valueOf(),
  stepName: 'Answering',
};

const followUpTextMessageStream: AgentTextMessageType = {
  type: 'TEXT_MESSAGE_CHUNK',
  timestamp: new Date().valueOf(),
  messageId: 'message_2',
  parentMessageId: 'message_1',
  delta: 'This is a follow-up answer.',
};

const followUpAnsweringStepFinishedStream: AgentStepType = {
  type: 'STEP_FINISHED',
  timestamp: new Date().valueOf(),
  stepName: 'Answering',
};

const followUpRunFinishedStream: AgentRunType = {
  type: 'RUN_FINISHED',
  timestamp: new Date().valueOf(),
  threadId: STREAM_ID,
  runId: ANSWER_ID_2,
  result: {
    completionReason: 'COMPLETED',
  },
};

export type AgentMessage =
  | AgentRunType
  | AgentCustomType
  | AgentStepType
  | AgentToolCallType
  | AgentToolCallArgsType
  | AgentTextMessageType
  | AgentCitationType;

export type AgentData = {
  answerStreams: Array<AgentMessage>;
  followUpStreams: Array<AgentMessage>;
  conversationId: string;
  answerId1: string;
  answerId2: string;
  conversationToken: string;
  citations: Array<AgentCitation>;
};

const agentData: AgentData = {
  answerStreams: [
    runStartStream,
    customHeaderWithFollowUpStream,
    searchStepStartedStream,
    searchToolCallStartStream,
    searchQueryToolCallArgsStream,
    searchToolCallEndStream,
    searchStepFinishedStream,
    answeringStepStartedStream,
    textMessageStream,
    citationStream,
    answeringStepFinishedStream,
    runFinishedStream,
  ],
  followUpStreams: [
    followUpRunStartStream,
    followUpCustomHeaderWithFollowUpStream,
    followUpThinkingStepStartedStream,
    followUpThinkingStepFinishedStream,
    followUpAnsweringStepStartedStream,
    followUpTextMessageStream,
    followUpAnsweringStepFinishedStream,
    followUpRunFinishedStream,
  ],
  conversationId: STREAM_ID,
  answerId1: ANSWER_ID_1,
  answerId2: ANSWER_ID_2,
  conversationToken: CONVERSATION_TOKEN,
  citations: [exampleCitation],
};

export default agentData;
