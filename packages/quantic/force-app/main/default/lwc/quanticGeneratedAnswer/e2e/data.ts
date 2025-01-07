const exampleStreamId = '123';
const genQaMarkdownTextPayload = {
  payloadType: 'genqa.messageType',
  payload: JSON.stringify({
    textDelta:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  }),
  finishReason: 'COMPLETED',
};
const genQaMarkdownTypePayload = {
  payloadType: 'genqa.headerMessageType',
  payload: JSON.stringify({
    contentFormat: 'text/markdown',
  }),
};
const genQaStreamEndPayload = {
  payloadType: 'genqa.endOfStreamType',
  payload: JSON.stringify({
    answerGenerated: true,
  }),
};
const exampleCitation = {
  id: 'some-id-1',
  title: 'Some Title 1',
  uri: 'https://www.coveo.com',
  permanentid: 'some-permanent-id-1',
  clickUri: '#',
  text: 'example text 1',
  source: 'Some source 1',
};
const exampleCitations = [exampleCitation];
const genQaCitationPayload = {
  payloadType: 'genqa.citationsType',
  payload: JSON.stringify({
    citations: exampleCitations,
  }),
};

export type GenQaData = {
  streamId: string;
  streams: Array<{payloadType: string; payload: string; finishReason?: string}>;
  citations: Array<Record<string, any>>;
};

const genQaData: GenQaData = {
  streamId: exampleStreamId,
  streams: [
    genQaMarkdownTypePayload,
    genQaMarkdownTextPayload,
    genQaCitationPayload,
    genQaStreamEndPayload,
  ],
  citations: exampleCitations,
};

export default genQaData;
