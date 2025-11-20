import {html, render} from 'lit';
import {fireEvent, within} from 'storybook/test';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type FeedbackButtonProps,
  renderFeedbackButton as feedbackButton,
} from './feedback-button';

describe('#renderFeedbackButton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderFeedbackButton = (
    props: Partial<FeedbackButtonProps>
  ): HTMLButtonElement => {
    render(
      html`${feedbackButton({
        props: {
          title: props.title ?? 'Test title',
          variant: props.variant ?? 'like',
          active: props.active ?? false,
          onClick: props.onClick ?? vi.fn(),
        },
      })}`,
      container
    );
    return within(container).getByRole('button') as HTMLButtonElement;
  };

  it('should render a button in the document', () => {
    const button = renderFeedbackButton({});
    expect(button).toBeInTheDocument();
  });

  it('should render a button with the correct title', () => {
    const button = renderFeedbackButton({title: 'This answer was helpful'});
    expect(button.getAttribute('title')).toBe('This answer was helpful');
  });

  it('should render a button with the correct part attribute', () => {
    const button = renderFeedbackButton({});
    expect(button.getAttribute('part')).toBe('feedback-button');
  });

  it('should render a button with the "like" variant class', () => {
    const button = renderFeedbackButton({variant: 'like'});
    expect(button).toHaveClass('like');
  });

  it('should render a button with the "dislike" variant class', () => {
    const button = renderFeedbackButton({variant: 'dislike'});
    expect(button).toHaveClass('dislike');
  });

  it('should render a button with the "active" class when active is true', () => {
    const button = renderFeedbackButton({active: true});
    expect(button).toHaveClass('active');
  });

  it('should not render a button with the "active" class when active is false', () => {
    const button = renderFeedbackButton({active: false});
    expect(button).not.toHaveClass('active');
  });

  it('should render a button with aria-pressed="true" when active is true', () => {
    const button = renderFeedbackButton({active: true});
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should render a button with aria-pressed="false" when active is false', () => {
    const button = renderFeedbackButton({active: false});
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('should render a button with feedback-button class', () => {
    const button = renderFeedbackButton({});
    expect(button).toHaveClass('feedback-button');
  });

  it('should render a button with rounded-md class', () => {
    const button = renderFeedbackButton({});
    expect(button).toHaveClass('rounded-md');
  });

  it('should render a button with p-2 class', () => {
    const button = renderFeedbackButton({});
    expect(button).toHaveClass('p-2');
  });

  it('should render an atomic-icon inside the button', () => {
    const button = renderFeedbackButton({});
    const icon = button.querySelector('atomic-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should render an atomic-icon with w-5 class', () => {
    const button = renderFeedbackButton({});
    const icon = button.querySelector('atomic-icon');
    expect(icon).toHaveClass('w-5');
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    const button = renderFeedbackButton({onClick});

    await fireEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should render a like button with all correct attributes', () => {
    const onClick = vi.fn();
    const button = renderFeedbackButton({
      title: 'This answer was helpful',
      variant: 'like',
      active: true,
      onClick,
    });

    expect(button.getAttribute('title')).toBe('This answer was helpful');
    expect(button).toHaveClass('like');
    expect(button).toHaveClass('active');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should render a dislike button with all correct attributes', () => {
    const onClick = vi.fn();
    const button = renderFeedbackButton({
      title: 'This answer was not helpful',
      variant: 'dislike',
      active: false,
      onClick,
    });

    expect(button.getAttribute('title')).toBe('This answer was not helpful');
    expect(button).toHaveClass('dislike');
    expect(button).not.toHaveClass('active');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
});
