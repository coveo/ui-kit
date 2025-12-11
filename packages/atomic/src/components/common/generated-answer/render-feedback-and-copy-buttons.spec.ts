import type {GeneratedAnswerState} from '@coveo/headless';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import * as copyButton from './copy-button';
import * as feedbackButton from './feedback-button';
import {
  type RenderFeedbackAndCopyButtonsProps,
  renderFeedbackAndCopyButtons,
} from './render-feedback-and-copy-buttons';

vi.mock('./copy-button', () => ({
  renderCopyButton: vi.fn(() => html`<button part="copy-button"></button>`),
}));

vi.mock('./feedback-button', () => ({
  renderFeedbackButton: vi.fn(
    () => html`<button part="feedback-button"></button>`
  ),
}));

vi.mock('./generated-answer-utils', () => ({
  hasClipboardSupport: vi.fn(() => true),
}));

describe('#renderFeedbackAndCopyButtons', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderFeedbackAndCopyButtonsProps> = {}
  ) => {
    const defaultProps: RenderFeedbackAndCopyButtonsProps = {
      i18n: i18n,
      generatedAnswerState: {
        liked: false,
        disliked: false,
        answer: 'Test answer',
        isStreaming: false,
      } as GeneratedAnswerState,
      withToggle: false,
      copied: false,
      copyError: false,
      getCopyToClipboardTooltip: vi.fn().mockReturnValue('Copy answer'),
      onClickLike: vi.fn(),
      onClickDislike: vi.fn(),
      onCopyToClipboard: vi.fn(),
    };

    const props = {...defaultProps, ...overrides};
    const element = await renderFunctionFixture(
      html`${renderFeedbackAndCopyButtons({props})}`
    );

    return {
      element,
      container: element.querySelector('.feedback-buttons'),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when streaming', () => {
    it('should return nothing', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      expect(element.children.length).toBe(0);
    });

    it('should not call renderFeedbackButton', async () => {
      await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      expect(feedbackButton.renderFeedbackButton).not.toHaveBeenCalled();
    });

    it('should not call renderCopyButton', async () => {
      await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      expect(copyButton.renderCopyButton).not.toHaveBeenCalled();
    });
  });

  describe('when not streaming', () => {
    it('should apply right-6 class when withToggle is false', async () => {
      const {container} = await renderComponent({withToggle: false});

      expect(container).toHaveClass('right-6');
      expect(container).not.toHaveClass('right-20');
    });

    it('should apply right-20 class when withToggle is true', async () => {
      const {container} = await renderComponent({withToggle: true});

      expect(container).toHaveClass('right-20');
      expect(container).not.toHaveClass('right-6');
    });

    it('should call renderFeedbackButton for like button with correct props', async () => {
      const onClickLike = vi.fn();
      await renderComponent({
        generatedAnswerState: {
          liked: true,
          isStreaming: false,
        } as GeneratedAnswerState,
        onClickLike,
      });

      expect(feedbackButton.renderFeedbackButton).toHaveBeenCalledWith({
        props: expect.objectContaining({
          title: 'Helpful',
          variant: 'like',
          active: true,
          onClick: onClickLike,
        }),
      });
    });

    it('should call renderFeedbackButton for dislike button with correct props', async () => {
      const onClickDislike = vi.fn();
      await renderComponent({
        generatedAnswerState: {
          disliked: true,
          isStreaming: false,
        } as GeneratedAnswerState,
        onClickDislike,
      });

      expect(feedbackButton.renderFeedbackButton).toHaveBeenCalledWith({
        props: expect.objectContaining({
          title: 'Not helpful',
          variant: 'dislike',
          active: true,
          onClick: onClickDislike,
        }),
      });
    });

    it('should call renderFeedbackButton twice (like and dislike)', async () => {
      await renderComponent();

      expect(feedbackButton.renderFeedbackButton).toHaveBeenCalledTimes(2);
    });

    describe('when clipboard is supported', () => {
      beforeEach(async () => {
        const {hasClipboardSupport} = await import('./generated-answer-utils');
        vi.mocked(hasClipboardSupport).mockReturnValue(true);
      });

      it('should call hasClipboardSupport', async () => {
        await renderComponent();

        const {hasClipboardSupport} = await import('./generated-answer-utils');
        expect(hasClipboardSupport).toHaveBeenCalled();
      });

      it('should call renderCopyButton with correct props', async () => {
        const getCopyToClipboardTooltip = vi
          .fn()
          .mockReturnValue('Custom tooltip');

        await renderComponent({
          copied: true,
          copyError: false,
          getCopyToClipboardTooltip,
        });

        expect(copyButton.renderCopyButton).toHaveBeenCalledWith({
          props: expect.objectContaining({
            title: 'Custom tooltip',
            isCopied: true,
            error: false,
          }),
        });
      });

      it('should call getCopyToClipboardTooltip', async () => {
        const getCopyToClipboardTooltip = vi
          .fn()
          .mockReturnValue('Copy answer');

        await renderComponent({getCopyToClipboardTooltip});

        expect(getCopyToClipboardTooltip).toHaveBeenCalled();
      });

      it('should pass onClick that calls onCopyToClipboard with answer', async () => {
        const onCopyToClipboard = vi.fn();
        const answer = 'Test answer to copy';

        await renderComponent({
          generatedAnswerState: {
            answer,
            isStreaming: false,
          } as GeneratedAnswerState,
          onCopyToClipboard,
        });

        const copyButtonCall = vi.mocked(copyButton.renderCopyButton).mock
          .calls[0][0];
        const onClickHandler = copyButtonCall.props.onClick;

        await onClickHandler();

        expect(onCopyToClipboard).toHaveBeenCalledWith(answer);
      });

      it('should not call onCopyToClipboard when answer is undefined', async () => {
        const onCopyToClipboard = vi.fn();

        await renderComponent({
          generatedAnswerState: {
            answer: undefined,
            isStreaming: false,
          } as GeneratedAnswerState,
          onCopyToClipboard,
        });

        const copyButtonCall = vi.mocked(copyButton.renderCopyButton).mock
          .calls[0][0];
        const onClickHandler = copyButtonCall.props.onClick;

        await onClickHandler();

        expect(onCopyToClipboard).not.toHaveBeenCalled();
      });
    });

    describe('when clipboard is not supported', () => {
      beforeEach(async () => {
        const {hasClipboardSupport} = await import('./generated-answer-utils');
        vi.mocked(hasClipboardSupport).mockReturnValue(false);
      });

      it('should not call renderCopyButton', async () => {
        await renderComponent();

        expect(copyButton.renderCopyButton).not.toHaveBeenCalled();
      });
    });
  });
});
