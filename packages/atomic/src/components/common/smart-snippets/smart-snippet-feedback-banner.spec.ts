import type {i18n} from 'i18next';
import {html, render} from 'lit';
import {fireEvent, within} from 'storybook/test';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  renderSmartSnippetFeedbackBanner,
  type SmartSnippetFeedbackBannerProps,
} from './smart-snippet-feedback-banner';

describe('#renderSmartSnippetFeedbackBanner', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockI18n = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'smart-snippet-feedback-inquiry': 'Does this answer your question?',
          yes: 'Yes',
          no: 'No',
          'smart-snippet-feedback-thanks': 'Thank you for your feedback!',
          'smart-snippet-feedback-explain-why': 'Explain why',
        };
        return translations[key] || key;
      }),
    } as unknown as i18n;
  });

  const renderFeedbackBanner = (
    props: Partial<SmartSnippetFeedbackBannerProps>
  ): HTMLElement => {
    const defaultProps: SmartSnippetFeedbackBannerProps = {
      i18n: mockI18n,
      id: 'test-id',
      liked: false,
      disliked: false,
      feedbackSent: false,
      onLike: vi.fn(),
      onDislike: vi.fn(),
      onPressExplainWhy: vi.fn(),
      ...props,
    };
    render(
      html`${renderSmartSnippetFeedbackBanner({props: defaultProps})}`,
      container
    );
    return container.querySelector('[part="feedback-banner"]')!;
  };

  it('should render the feedback banner', () => {
    const banner = renderFeedbackBanner({});
    expect(banner).toBeInTheDocument();
  });

  it('should render with feedback-banner part', () => {
    const banner = renderFeedbackBanner({});
    expect(banner.getAttribute('part')).toBe('feedback-banner');
  });

  it('should render the feedback inquiry text', () => {
    renderFeedbackBanner({});
    const inquiry = container.querySelector('[part="feedback-inquiry"]');
    expect(inquiry?.textContent?.trim()).toBe(
      'Does this answer your question?'
    );
  });

  it('should render the feedback inquiry with correct id', () => {
    renderFeedbackBanner({id: 'custom-id'});
    const inquiry = container.querySelector('[part="feedback-inquiry"]');
    expect(inquiry?.getAttribute('id')).toBe('feedback-inquiry-custom-id');
  });

  it('should render like and dislike buttons', () => {
    renderFeedbackBanner({});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(likeButton).toBeInTheDocument();
    expect(dislikeButton).toBeInTheDocument();
  });

  it('should render checkmark icon for like button', () => {
    renderFeedbackBanner({});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    const icon = likeButton?.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should render cross icon for dislike button', () => {
    renderFeedbackBanner({});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    const icon = dislikeButton?.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should render radio buttons with correct group name', () => {
    renderFeedbackBanner({id: 'test-id'});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    expect(radioButtons.length).toBe(2);
    radioButtons.forEach((radio) => {
      expect(radio.getAttribute('name')).toBe('feedback-options-test-id');
    });
  });

  it('should call onLike when like radio button is clicked', async () => {
    const onLike = vi.fn();
    renderFeedbackBanner({onLike});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    const likeRadio = Array.from(radioButtons).find(
      (radio) => (radio as HTMLInputElement).value === 'Yes'
    ) as HTMLInputElement;
    await fireEvent.click(likeRadio);
    expect(onLike).toHaveBeenCalled();
  });

  it('should call onDislike when dislike radio button is clicked', async () => {
    const onDislike = vi.fn();
    renderFeedbackBanner({onDislike});
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    const dislikeRadio = Array.from(radioButtons).find(
      (radio) => (radio as HTMLInputElement).value === 'No'
    ) as HTMLInputElement;
    await fireEvent.click(dislikeRadio);
    expect(onDislike).toHaveBeenCalled();
  });

  it('should apply text-success class when liked', () => {
    renderFeedbackBanner({liked: true});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    expect(likeButton).toHaveClass('text-success');
  });

  it('should apply text-error class when disliked', () => {
    renderFeedbackBanner({disliked: true});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(dislikeButton).toHaveClass('text-error');
  });

  it('should not show thank you message when neither liked nor disliked', () => {
    renderFeedbackBanner({liked: false, disliked: false});
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).not.toBeInTheDocument();
  });

  it('should show thank you message when liked', () => {
    renderFeedbackBanner({liked: true});
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).toBeInTheDocument();
    expect(thankYou?.textContent?.trim()).toBe('Thank you for your feedback!');
  });

  it('should show thank you message when disliked', () => {
    renderFeedbackBanner({disliked: true});
    const thankYou = container.querySelector('[part="feedback-thank-you"]');
    expect(thankYou).toBeInTheDocument();
  });

  it('should show explain why button when disliked and feedback not sent', () => {
    renderFeedbackBanner({disliked: true, feedbackSent: false});
    const explainWhyButton = within(container).queryByText('Explain why');
    expect(explainWhyButton).toBeInTheDocument();
  });

  it('should not show explain why button when liked', () => {
    renderFeedbackBanner({liked: true, disliked: false, feedbackSent: false});
    const explainWhyButton = within(container).queryByText('Explain why');
    expect(explainWhyButton).not.toBeInTheDocument();
  });

  it('should not show explain why button when feedback sent', () => {
    renderFeedbackBanner({disliked: true, feedbackSent: true});
    const explainWhyButton = within(container).queryByText('Explain why');
    expect(explainWhyButton).not.toBeInTheDocument();
  });

  it('should call onPressExplainWhy when explain why button is clicked', async () => {
    const onPressExplainWhy = vi.fn();
    renderFeedbackBanner({
      disliked: true,
      feedbackSent: false,
      onPressExplainWhy,
    });
    const explainWhyButton = within(container).getByText('Explain why');
    await fireEvent.click(explainWhyButton);
    expect(onPressExplainWhy).toHaveBeenCalled();
  });

  it('should render radiogroup with correct aria-labelledby', () => {
    renderFeedbackBanner({id: 'test-id'});
    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup?.getAttribute('aria-labelledby')).toBe(
      'feedback-inquiry-test-id'
    );
  });

  it('should render thank you wrapper when visible', () => {
    renderFeedbackBanner({liked: true});
    const wrapper = container.querySelector(
      '[part="feedback-thank-you-wrapper"]'
    );
    expect(wrapper).toBeInTheDocument();
  });

  it('should set explainWhyRef when provided', () => {
    const ref = vi.fn();
    renderFeedbackBanner({
      disliked: true,
      feedbackSent: false,
      explainWhyRef: ref,
    });
    expect(ref).toHaveBeenCalled();
  });

  it('should call i18n.t for all translation keys', () => {
    renderFeedbackBanner({disliked: true, feedbackSent: false});
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet-feedback-inquiry');
    expect(mockI18n.t).toHaveBeenCalledWith('yes');
    expect(mockI18n.t).toHaveBeenCalledWith('no');
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet-feedback-thanks');
    expect(mockI18n.t).toHaveBeenCalledWith(
      'smart-snippet-feedback-explain-why'
    );
  });

  it('should apply correct classes to like button when not liked', () => {
    renderFeedbackBanner({liked: false});
    const likeButton = container.querySelector('[part="feedback-like-button"]');
    expect(likeButton).toHaveClass('cursor-pointer');
    expect(likeButton).toHaveClass('hover:underline');
    expect(likeButton).not.toHaveClass('text-success');
  });

  it('should apply correct classes to dislike button when not disliked', () => {
    renderFeedbackBanner({disliked: false});
    const dislikeButton = container.querySelector(
      '[part="feedback-dislike-button"]'
    );
    expect(dislikeButton).toHaveClass('cursor-pointer');
    expect(dislikeButton).toHaveClass('hover:underline');
    expect(dislikeButton).not.toHaveClass('text-error');
  });
});
