import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import type {
  AtomicGeneratedAnswerContent,
  GeneratedAnswer,
} from '@/src/components/common/atomic-generated-answer-content/atomic-generated-answer-content';
import type {AtomicGeneratedAnswerThreadItem} from '@/src/components/common/atomic-generated-answer-thread-item/atomic-generated-answer-thread-item';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicGeneratedAnswerThread} from './atomic-generated-answer-thread';
import './atomic-generated-answer-thread';

const createGeneratedAnswer = (
  index: number,
  overrides: Partial<GeneratedAnswer> = {}
): GeneratedAnswer => ({
  question: `Question ${index}`,
  answer: `Answer ${index}`,
  answerId: `answer-${index}`,
  answerContentFormat: 'text/markdown',
  citations: [],
  isStreaming: false,
  liked: false,
  disliked: false,
  feedbackSubmitted: false,
  expanded: true,
  isLoading: false,
  cannotAnswer: false,
  ...overrides,
});

const createGeneratedAnswers = (count: number) =>
  Array.from({length: count}, (_, index) => createGeneratedAnswer(index + 1));

describe('generated-answer-thread', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const renderComponent = async (
    options: {
      generatedAnswers?: GeneratedAnswer[];
      i18nInstance?: i18n;
      renderCitations?: AtomicGeneratedAnswerThread['renderCitations'];
      onClickLike?: AtomicGeneratedAnswerThread['onClickLike'];
      onClickDislike?: AtomicGeneratedAnswerThread['onClickDislike'];
      onCopyToClipboard?: AtomicGeneratedAnswerThread['onCopyToClipboard'];
    } = {}
  ) => {
    const {
      generatedAnswers = createGeneratedAnswers(1),
      i18nInstance = i18n,
      renderCitations,
      onClickLike,
      onClickDislike,
      onCopyToClipboard,
    } = options;

    const defaultRenderCitations = () => html``;
    const noop = () => {};

    const element = await fixture<AtomicGeneratedAnswerThread>(html`
      <atomic-generated-answer-thread
        .generatedAnswers=${generatedAnswers}
        .i18n=${i18nInstance}
        .renderCitations=${renderCitations ?? defaultRenderCitations}
        .onClickLike=${onClickLike ?? noop}
        .onClickDislike=${onClickDislike ?? noop}
        .onCopyToClipboard=${onCopyToClipboard ?? noop}
      ></atomic-generated-answer-thread>
    `);

    await element.updateComplete;

    return {
      element,
      locators: () => ({
        threadItems: Array.from(
          element.shadowRoot?.querySelectorAll(
            'atomic-generated-answer-thread-item'
          ) ?? []
        ) as AtomicGeneratedAnswerThreadItem[],
        answerContents: Array.from(
          element.shadowRoot?.querySelectorAll(
            'atomic-generated-answer-content'
          ) ?? []
        ) as AtomicGeneratedAnswerContent[],
        showPreviousAnswersButton:
          element.shadowRoot?.querySelector('button') ?? null,
      }),
    };
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  it('should render a single thread item when only one generated answer is provided', async () => {
    const generatedAnswers = createGeneratedAnswers(1);
    const {locators} = await renderComponent({generatedAnswers});

    expect(locators().threadItems).toHaveLength(1);
    expect(locators().showPreviousAnswersButton).toBeNull();
  });

  it('should render every answer when exactly two generated answers are provided', async () => {
    const generatedAnswers = createGeneratedAnswers(2);
    const {locators} = await renderComponent({generatedAnswers});

    expect(locators().threadItems).toHaveLength(2);
    expect(locators().answerContents[0]?.generatedAnswer.question).toBe(
      'Question 1'
    );
    expect(locators().answerContents[1]?.generatedAnswer.question).toBe(
      'Question 2'
    );
    expect(locators().showPreviousAnswersButton).toBeNull();
  });

  it('should not render thread items when the generated answers list is empty', async () => {
    const {locators} = await renderComponent({generatedAnswers: []});

    expect(locators().threadItems).toHaveLength(0);
    expect(locators().showPreviousAnswersButton).toBeNull();
  });

  it('should render only the latest answer and the show previous answers button when multiple answers exist', async () => {
    const generatedAnswers = createGeneratedAnswers(3);
    const {locators} = await renderComponent({generatedAnswers});

    expect(locators().threadItems).toHaveLength(1);
    expect(locators().answerContents[0]?.generatedAnswer.question).toBe(
      'Question 3'
    );
    expect(locators().showPreviousAnswersButton).toBeInTheDocument();
  });

  it('should reveal every answer after clicking the show previous answers button', async () => {
    const generatedAnswers = createGeneratedAnswers(3);
    const {element, locators} = await renderComponent({generatedAnswers});

    const button = locators().showPreviousAnswersButton as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const updatedLocators = locators();
    expect(updatedLocators.threadItems).toHaveLength(3);
    expect(updatedLocators.showPreviousAnswersButton).toBeNull();
  });

  it('should pass collapse-related props to the last visible thread item', async () => {
    const generatedAnswers = createGeneratedAnswers(3);
    const {locators} = await renderComponent({generatedAnswers});

    const [latestItem] = locators().threadItems;
    expect(latestItem?.hideLine).toBe(true);
    expect(latestItem?.disableCollapse).toBe(true);
    expect(latestItem?.isExpanded).toBe(true);
  });

  it('should pass callback and rendering props down to answer-content', async () => {
    const renderCitations = vi.fn();
    const onClickLike = vi.fn();
    const onClickDislike = vi.fn();
    const onCopyToClipboard = vi.fn();

    const generatedAnswers = createGeneratedAnswers(2);
    const {locators} = await renderComponent({
      generatedAnswers,
      renderCitations,
      onClickLike,
      onClickDislike,
      onCopyToClipboard,
    });

    const [answerContent] = locators().answerContents;
    expect(answerContent).toBeDefined();
    expect(answerContent?.i18n).toBe(i18n);
    expect(answerContent?.renderCitations).toBe(renderCitations);
    expect(answerContent?.onClickLike).toBe(onClickLike);
    expect(answerContent?.onClickDislike).toBe(onClickDislike);
    expect(answerContent?.onCopyToClipboard).toBe(onCopyToClipboard);
  });

  it('should collapse back to the latest answer when the generated answers list changes', async () => {
    const {element, locators} = await renderComponent({
      generatedAnswers: createGeneratedAnswers(3),
    });

    const button = locators().showPreviousAnswersButton as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    element.generatedAnswers = createGeneratedAnswers(4);
    await element.updateComplete;
    await element.updateComplete;

    const updatedLocators = locators();
    expect(updatedLocators.threadItems).toHaveLength(1);
    expect(updatedLocators.answerContents[0]?.generatedAnswer.question).toBe(
      'Question 4'
    );
    expect(updatedLocators.showPreviousAnswersButton).toBeInTheDocument();
  });

  it('should keep all answers visible when the list updates with the same length', async () => {
    const {element, locators} = await renderComponent({
      generatedAnswers: createGeneratedAnswers(3),
    });

    const button = locators().showPreviousAnswersButton as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    element.generatedAnswers = [
      createGeneratedAnswer(10),
      createGeneratedAnswer(11),
      createGeneratedAnswer(12),
    ];
    await element.updateComplete;

    const updatedLocators = locators();
    expect(updatedLocators.threadItems).toHaveLength(3);
    expect(updatedLocators.showPreviousAnswersButton).toBeNull();
  });

  it('should only disable collapse for the last item when all answers show', async () => {
    const generatedAnswers = createGeneratedAnswers(3);
    const {element, locators} = await renderComponent({generatedAnswers});

    const button = locators().showPreviousAnswersButton as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const items = locators().threadItems;
    expect(items).toHaveLength(3);
    items.slice(0, -1).forEach((item) => {
      expect(item.hideLine).toBe(false);
      expect(item.disableCollapse).toBe(false);
      expect(item.isExpanded).toBe(false);
    });
    const lastItem = items.at(-1);
    expect(lastItem?.hideLine).toBe(true);
    expect(lastItem?.disableCollapse).toBe(true);
    expect(lastItem?.isExpanded).toBe(true);
  });

  it('should translate the show previous questions label using the provided i18n instance', async () => {
    const translate = vi
      .fn()
      .mockImplementation((key: string) =>
        key === 'show-previous-questions'
          ? 'Afficher les questions précédentes'
          : key
      );
    const translatedI18n = {t: translate} as unknown as i18n;

    const {locators} = await renderComponent({
      generatedAnswers: createGeneratedAnswers(3),
      i18nInstance: translatedI18n,
    });

    const button = locators().showPreviousAnswersButton as HTMLButtonElement;
    expect(button).toHaveTextContent('Afficher les questions précédentes');
  });
});
