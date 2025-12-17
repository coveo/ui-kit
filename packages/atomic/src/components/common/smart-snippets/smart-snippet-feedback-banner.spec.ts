import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  renderSmartSnippetFeedbackBanner,
  type SmartSnippetFeedbackBannerProps,
} from './smart-snippet-feedback-banner';

describe('#renderSmartSnippetFeedbackBanner', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderFeedbackBanner = async (
    props: Partial<SmartSnippetFeedbackBannerProps> = {}
  ) => {
    const defaultProps: SmartSnippetFeedbackBannerProps = {
      i18n,
      id: 'test-id',
      liked: false,
      disliked: false,
      feedbackSent: false,
      onLike: vi.fn(),
      onDislike: vi.fn(),
      onPressExplainWhy: vi.fn(),
      ...props,
    };
    return await renderFunctionFixture(
      html`${renderSmartSnippetFeedbackBanner({props: defaultProps})}`
    );
  };

  it('should render the feedback banner', async () => {
    const container = await renderFeedbackBanner({});
    const banner = container.querySelector('[part="feedback-banner"]');
    expect(banner).toBeInTheDocument();
  });

  it('should render with feedback-banner part', async () => {
    const container = await renderFeedbackBanner({});
    const banner = container.querySelector('[part="feedback-banner"]');
    expect(banner?.getAttribute('part')).toBe('feedback-banner');
  });

  it('should render the feedback inquiry text', async () => {
    const container = await renderFeedbackBanner({});
    const inquiry = container.querySelector('[part="feedback-inquiry"]');
    expect(inquiry?.textContent?.trim()).toBe(
      i18n.t('smart-snippet-feedback-inquiry')
    );
  });

  it('should render the feedback inquiry with correct id', async () => {
    const container = await renderFeedbackBanner({id: 'custom-id'});
    const inquiry = container.querySelector('[part="feedback-inquiry"]');
    expect(inquiry?.getAttribute('id')).toBe('feedback-inquiry-custom-id');
  });

  it('should render like and dislike buttons', async () => {
    const container = await renderFeedbackBanner({});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(likeButton).toBeInTheDocument();
    expect(dislikeButton).toBeInTheDocument();
  });

  it('should render checkmark icon for like button', async () => {
    const container = await renderFeedbackBanner({});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    const icon = likeButton?.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should render cross icon for dislike button', async () => {
    const container = await renderFeedbackBanner({});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    const icon = dislikeButton?.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should render radio buttons with correct group name', async () => {
    const container = await renderFeedbackBanner({id: 'test-id'});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    expect(radioButtons.length).toBe(2);
    radioButtons.forEach((radio) => {
      expect(radio.getAttribute('name')).toBe('feedback-options-test-id');
    });
  });

  it('should call onLike when like radio button is clicked', async () => {
    const onLike = vi.fn();
    const container = await renderFeedbackBanner({onLike});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    const likeRadio = Array.from(radioButtons).find(
      (radio) => (radio as HTMLInputElement).value === i18n.t('yes')
    ) as HTMLInputElement;
    likeRadio.click();
    expect(onLike).toHaveBeenCalled();
  });

  it('should call onDislike when dislike radio button is clicked', async () => {
    const onDislike = vi.fn();
    const container = await renderFeedbackBanner({onDislike});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    const dislikeRadio = Array.from(radioButtons).find(
      (radio) => (radio as HTMLInputElement).value === i18n.t('no')
    ) as HTMLInputElement;
    dislikeRadio.click();
    expect(onDislike).toHaveBeenCalled();
  });

  it('should apply text-success class when liked', async () => {
    const container = await renderFeedbackBanner({liked: true});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    expect(likeButton).toHaveClass('text-success');
  });

  it('should apply text-error class when disliked', async () => {
    const container = await renderFeedbackBanner({disliked: true});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(dislikeButton).toHaveClass('text-error');
  });

  it('should not show thank you message when neither liked nor disliked', async () => {
    const container = await renderFeedbackBanner({
      liked: false,
      disliked: false,
    });
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).not.toBeInTheDocument();
  });

  it('should show thank you message when liked', async () => {
    const container = await renderFeedbackBanner({liked: true});
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).toBeInTheDocument();
    expect(thankYou?.textContent?.trim()).toBe(
      i18n.t('smart-snippet-feedback-thanks')
    );
  });

  it('should show thank you message when disliked', async () => {
    const container = await renderFeedbackBanner({disliked: true});
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).toBeInTheDocument();
  });

  it('should show explain why button when disliked and feedback not sent', async () => {
    await renderFeedbackBanner({
      disliked: true,
      feedbackSent: false,
    });
    const explainWhyButton = page.getByText(
      i18n.t('smart-snippet-feedback-explain-why')
    );
    await expect.element(explainWhyButton).toBeInTheDocument();
  });

  it('should not show explain why button when liked', async () => {
    await renderFeedbackBanner({
      liked: true,
      disliked: false,
      feedbackSent: false,
    });
    const explainWhyButton = page.getByText(
      i18n.t('smart-snippet-feedback-explain-why')
    );
    await expect.element(explainWhyButton).not.toBeInTheDocument();
  });

  it('should not show explain why button when feedback sent', async () => {
    await renderFeedbackBanner({
      disliked: true,
      feedbackSent: true,
    });
    const explainWhyButton = page.getByText(
      i18n.t('smart-snippet-feedback-explain-why')
    );
    await expect.element(explainWhyButton).not.toBeInTheDocument();
  });

  it('should call onPressExplainWhy when explain why button is clicked', async () => {
    const onPressExplainWhy = vi.fn();
    await renderFeedbackBanner({
      disliked: true,
      feedbackSent: false,
      onPressExplainWhy,
    });
    const explainWhyButton = page.getByRole('button', {
      name: i18n.t('smart-snippet-feedback-explain-why'),
    });
    await explainWhyButton.click();
    expect(onPressExplainWhy).toHaveBeenCalled();
  });

  it('should render radiogroup with correct aria-labelledby', async () => {
    const container = await renderFeedbackBanner({id: 'test-id'});
    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup?.getAttribute('aria-labelledby')).toBe(
      'feedback-inquiry-test-id'
    );
  });

  it('should render thank you wrapper when visible', async () => {
    const container = await renderFeedbackBanner({liked: true});
    const wrapper = container.querySelector(
      '[part="feedback-thank-you-wrapper"]'
    );
    expect(wrapper).toBeInTheDocument();
  });

  it('should set explainWhyRef when provided', async () => {
    const ref = vi.fn();
    await renderFeedbackBanner({
      disliked: true,
      feedbackSent: false,
      explainWhyRef: ref,
    });
    expect(ref).toHaveBeenCalled();
  });

  it('should apply correct classes to like button when not liked', async () => {
    const container = await renderFeedbackBanner({liked: false});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    expect(likeButton).toHaveClass('cursor-pointer');
    expect(likeButton).toHaveClass('hover:underline');
    expect(likeButton).not.toHaveClass('text-success');
  });

  it('should apply correct classes to dislike button when not disliked', async () => {
    const container = await renderFeedbackBanner({disliked: false});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(dislikeButton).toHaveClass('cursor-pointer');
    expect(dislikeButton).toHaveClass('hover:underline');
    expect(dislikeButton).not.toHaveClass('text-error');
  });
});
