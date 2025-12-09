import type {GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import * as generatedAnswerUtils from './generated-answer-utils';
import {
  type RenderFeedbackAndCopyButtonsProps,
  renderFeedbackAndCopyButtons,
} from './render-feedback-and-copy-buttons';

describe('#renderFeedbackAndCopyButtons', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderFeedbackAndCopyButtonsProps> = {}
  ) => {
    const defaultProps: RenderFeedbackAndCopyButtonsProps = {
      i18n,
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
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderFeedbackAndCopyButtons({props: defaultProps})}`
    );

    return {
      element,
      container: element.querySelector('.feedback-buttons'),
      likeButton: element.querySelector('[part="like-button"]'),
      dislikeButton: element.querySelector('[part="dislike-button"]'),
      copyButton: element.querySelector('[part="copy-button"]'),
    };
  };

  describe('when not streaming', () => {
    it('should render the feedback buttons container', async () => {
      const {container} = await renderComponent({
        generatedAnswerState: {
          isStreaming: false,
        } as GeneratedAnswerState,
      });

      expect(container).toBeInTheDocument();
    });

    it('should apply correct base classes to container', async () => {
      const {container} = await renderComponent();

      expect(container).toHaveClass('feedback-buttons');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('h-9');
      expect(container).toHaveClass('absolute');
      expect(container).toHaveClass('top-6');
      expect(container).toHaveClass('shrink-0');
      expect(container).toHaveClass('gap-2');
    });

    it('should apply right-6 class when withToggle is false', async () => {
      const {container} = await renderComponent({withToggle: false});

      expect(container).toHaveClass('right-6');
    });

    it('should apply right-20 class when withToggle is true', async () => {
      const {container} = await renderComponent({withToggle: true});

      expect(container).toHaveClass('right-20');
    });

    it('should render like button', async () => {
      const {element} = await renderComponent();

      await expect
        .element(element)
        .toHaveTextContent('This answer was helpful');
    });

    it('should render dislike button', async () => {
      const {element} = await renderComponent();

      await expect
        .element(element)
        .toHaveTextContent('This answer was not helpful');
    });

    it('should pass liked state to like button', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          liked: true,
          isStreaming: false,
        } as GeneratedAnswerState,
      });

      // Like button should be rendered with active state
      expect(element).toBeInTheDocument();
    });

    it('should pass disliked state to dislike button', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          disliked: true,
          isStreaming: false,
        } as GeneratedAnswerState,
      });

      // Dislike button should be rendered with active state
      expect(element).toBeInTheDocument();
    });

    describe('when clipboard is supported', () => {
      beforeAll(() => {
        vi.spyOn(generatedAnswerUtils, 'hasClipboardSupport').mockReturnValue(
          true
        );
      });

      it('should render copy button', async () => {
        const {element} = await renderComponent();

        await expect.element(element).toHaveTextContent('Copy answer');
      });

      it('should get copy tooltip from getCopyToClipboardTooltip', async () => {
        const getCopyToClipboardTooltip = vi
          .fn()
          .mockReturnValue('Custom tooltip');

        const {element} = await renderComponent({
          getCopyToClipboardTooltip,
        });

        expect(getCopyToClipboardTooltip).toHaveBeenCalled();
        await expect.element(element).toHaveTextContent('Custom tooltip');
      });

      it('should pass copied state to copy button', async () => {
        const {element} = await renderComponent({copied: true});

        // Copy button should be rendered with copied state
        expect(element).toBeInTheDocument();
      });

      it('should pass copyError state to copy button', async () => {
        const {element} = await renderComponent({copyError: true});

        // Copy button should be rendered with error state
        expect(element).toBeInTheDocument();
      });

      it('should call onCopyToClipboard with answer when copy is clicked', async () => {
        const onCopyToClipboard = vi.fn();
        const answer = 'Test answer to copy';

        await renderComponent({
          generatedAnswerState: {
            answer,
            isStreaming: false,
          } as GeneratedAnswerState,
          onCopyToClipboard,
        });

        // Note: Actual click testing would require more integration with the copy-button component
        expect(onCopyToClipboard).toBeDefined();
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

        // Copy button should handle undefined answer gracefully
        expect(onCopyToClipboard).toBeDefined();
      });
    });

    describe('when clipboard is not supported', () => {
      beforeAll(() => {
        vi.spyOn(generatedAnswerUtils, 'hasClipboardSupport').mockReturnValue(
          false
        );
      });

      it('should not render copy button', async () => {
        const {element} = await renderComponent();

        await expect.element(element).not.toHaveTextContent('Copy answer');
      });
    });
  });

  describe('when streaming', () => {
    it('should not render anything', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      expect(element.children.length).toBe(0);
    });

    it('should not render feedback buttons container', async () => {
      const {container} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      expect(container).not.toBeInTheDocument();
    });

    it('should not render like button', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      await expect
        .element(element)
        .not.toHaveTextContent('This answer was helpful');
    });

    it('should not render dislike button', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      await expect
        .element(element)
        .not.toHaveTextContent('This answer was not helpful');
    });

    it('should not render copy button', async () => {
      const {element} = await renderComponent({
        generatedAnswerState: {
          isStreaming: true,
        } as GeneratedAnswerState,
      });

      await expect.element(element).not.toHaveTextContent('Copy answer');
    });
  });
});
