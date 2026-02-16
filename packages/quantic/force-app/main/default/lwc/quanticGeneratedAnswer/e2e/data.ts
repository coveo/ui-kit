const exampleStreamId = crypto.randomUUID();
const genQaMarkdownTextPayload = {
  payloadType: 'genqa.messageType',
  payload: JSON.stringify({
    textDelta:
      'THIS IS SOME LOREM IPSUM: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin accumsan felis vel nulla venenatis, vel volutpat mauris suscipit. Praesent aliquam, ex et dapibus fermentum, ligula metus condimentum nunc, non vehicula magna magna a nulla. Integer efficitur nunc eget semper facilisis. Quisque nec tortor at nunc blandit dictum sit amet vel mauris. Duis at tellus sit amet mi pharetra tincidunt. Nullam id risus eget risus accumsan molestie ac quis velit. Vivamus consectetur nisi vel enim finibus, nec laoreet risus facilisis. Integer a lacinia ligula. Etiam cursus urna nisi, ut tincidunt elit consectetur quis. Pellentesque nec sem vel neque malesuada euismod vitae nec augue. Suspendisse non ligula eu purus posuere dictum quis et magna. Curabitur dignissim, magna non feugiat consectetur, lorem orci fringilla sapien, sit amet vehicula eros nulla eget enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin accumsan felis vel nulla venenatis, vel volutpat mauris suscipit. Praesent aliquam, ex et dapibus fermentum, ligula metus condimentum nunc, non vehicula magna magna a nulla. Integer efficitur nunc eget semper facilisis. Quisque nec tortor at nunc blandit dictum sit amet vel mauris. Duis at tellus sit amet mi pharetra tincidunt. Nullam id risus eget risus accumsan molestie ac quis velit. Vivamus consectetur nisi vel enim finibus, nec laoreet risus facilisis. Integer a lacinia ligula. Etiam cursus urna nisi, ut tincidunt elit consectetur quis. Pellentesque nec sem vel neque malesuada euismod vitae nec augue. Suspendisse non ligula eu purus posuere dictum quis et magna. Curabitur dignissim, magna non feugiat consectetur, lorem orci fringilla sapien, sit amet vehicula eros nulla eget enim.',
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
  clickUri: 'https://www.coveo.com',
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
