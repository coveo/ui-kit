import {createElement} from 'lwc';
import QuanticGeneratedAnswerBody from 'c/quanticGeneratedAnswerBody';

jest.mock('c/quanticHeadlessLoader');

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
});

it('renders content and citations when provided', async () => {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });
  element.generatedAnswer = {
    answer: 'This is an answer',
    citations: [{id: 'c1', title: 'Doc 1'}],
    isStreaming: false,
  };
  document.body.appendChild(element);
  await flushPromises();

  const content = element.shadowRoot.querySelector(
    'c-quantic-generated-answer-content'
  );
  expect(content).not.toBeNull();

  const citations = element.shadowRoot.querySelector(
    'c-quantic-source-citations'
  );
  expect(citations).not.toBeNull();
});

it('passes feedback state to c-quantic-feedback based on generatedAnswer', async () => {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });
  element.generatedAnswer = {
    liked: true,
    answer: 'ok',
    citations: [],
    isStreaming: false,
  };
  document.body.appendChild(element);
  await flushPromises();

  const feedback = element.shadowRoot.querySelector('c-quantic-feedback');
  expect(feedback).not.toBeNull();
  expect(feedback.state).toBe('liked');

  element.generatedAnswer = {
    disliked: true,
    answer: 'ok',
    citations: [],
    isStreaming: false,
  };
  await flushPromises();
  expect(feedback.state).toBe('disliked');

  element.generatedAnswer = {answer: 'ok', citations: [], isStreaming: false};
  await flushPromises();
  expect(feedback.state).toBe('neutral');
});

it('bubbles child events (like, generatedanswercopy) to the parent', async () => {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });
  element.generatedAnswer = {answer: 'ok', citations: [], isStreaming: false};
  document.body.appendChild(element);
  await flushPromises();

  const likeHandler = jest.fn();
  const copyHandler = jest.fn();
  element.addEventListener('quantic__like', likeHandler);
  element.addEventListener('quantic__generatedanswercopy', copyHandler);

  const feedback = element.shadowRoot.querySelector('c-quantic-feedback');
  feedback.dispatchEvent(
    new CustomEvent('quantic__like', {bubbles: true, composed: true})
  );
  expect(likeHandler).toHaveBeenCalledTimes(1);

  const copy = element.shadowRoot.querySelector(
    'c-quantic-generated-answer-copy-to-clipboard'
  );
  copy.dispatchEvent(
    new CustomEvent('quantic__generatedanswercopy', {
      bubbles: true,
      composed: true,
      detail: {answerId: 'a1'},
    })
  );
  expect(copyHandler).toHaveBeenCalledTimes(1);
});

it('forwards citation hover as quantic__citationhover event', async () => {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });
  element.generatedAnswer = {
    answer: 'ok',
    citations: [{id: 'c1'}],
    isStreaming: false,
  };
  document.body.appendChild(element);
  await flushPromises();

  const citationHoverHandler = jest.fn();
  element.addEventListener('quantic__citationhover', citationHoverHandler);

  const citations = element.shadowRoot.querySelector(
    'c-quantic-source-citations'
  );
  citations.citationHoverHandler('c1', 123);

  expect(citationHoverHandler).toHaveBeenCalledTimes(1);
  const ev = citationHoverHandler.mock.calls[0][0];
  expect(ev.detail).toEqual({citationId: 'c1', citationHoverTimeMs: 123});
});

it('shouldDisplayCitations and shouldDisplayActions getters behave correctly', async () => {
  const element = createElement('c-quantic-generated-answer-body', {
    is: QuanticGeneratedAnswerBody,
  });

  // No citations, no answer => both false
  element.generatedAnswer = {answer: '', citations: [], isStreaming: false};
  document.body.appendChild(element);
  await flushPromises();
  expect(
    element.shadowRoot.querySelector('c-quantic-source-citations')
  ).toBeNull();
  expect(
    element.shadowRoot.querySelector(
      '[data-testid="generated-answer__actions"]'
    )
  ).toBeNull();

  // Has citations only
  element.generatedAnswer = {
    answer: '',
    citations: [{id: 'c1'}],
    isStreaming: false,
  };
  await flushPromises();
  expect(
    element.shadowRoot.querySelector('c-quantic-source-citations')
  ).not.toBeNull();
  expect(
    element.shadowRoot.querySelector(
      '[data-testid="generated-answer__actions"]'
    )
  ).toBeNull();

  // Has answer and not streaming => actions true
  element.generatedAnswer = {answer: 'ok', citations: [], isStreaming: false};
  await flushPromises();
  expect(
    element.shadowRoot.querySelector('c-quantic-source-citations')
  ).toBeNull();
  expect(
    element.shadowRoot.querySelector(
      '[data-testid="generated-answer__actions"]'
    )
  ).not.toBeNull();

  // Is streaming => actions false
  element.generatedAnswer = {answer: 'ok', citations: [], isStreaming: true};
  await flushPromises();
  expect(
    element.shadowRoot.querySelector(
      '[data-testid="generated-answer__actions"]'
    )
  ).toBeNull();
});
