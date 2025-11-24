import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import Thumbs from '../../../images/thumbs.svg';
import {
  type FeedbackButtonProps,
  renderFeedbackButton,
} from './feedback-button';

describe('#renderFeedbackButton', () => {
  const renderComponent = async (props: Partial<FeedbackButtonProps> = {}) => {
    const element = await renderFunctionFixture(
      html`${renderFeedbackButton({
        props: {
          title: props.title ?? 'Test title',
          variant: props.variant ?? 'like',
          active: props.active ?? false,
          onClick: props.onClick ?? vi.fn(),
        },
      })}`
    );

    return element.querySelector('button') as HTMLButtonElement;
  };

  it('should render a button in the document', async () => {
    const button = await renderComponent({});
    expect(button).toBeInTheDocument();
  });

  it('should render a button with the correct title', async () => {
    const button = await renderComponent({title: 'This answer was helpful'});
    expect(button.getAttribute('title')).toBe('This answer was helpful');
  });

  it('should render a button with the correct part attribute', async () => {
    const button = await renderComponent({});
    expect(button.getAttribute('part')).toBe('feedback-button');
  });

  it('should render a button with the "like" variant class', async () => {
    const button = await renderComponent({variant: 'like'});
    expect(button).toHaveClass('like');
  });

  it('should render a button with the "dislike" variant class', async () => {
    const button = await renderComponent({variant: 'dislike'});
    expect(button).toHaveClass('dislike');
  });

  it('should render a button with the "active" class when active is true', async () => {
    const button = await renderComponent({active: true});
    expect(button).toHaveClass('active');
  });

  it('should not render a button with the "active" class when active is false', async () => {
    const button = await renderComponent({active: false});
    expect(button).not.toHaveClass('active');
  });

  it('should render a button with aria-pressed="true" when active is true', async () => {
    const button = await renderComponent({active: true});
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should render a button with aria-pressed="false" when active is false', async () => {
    const button = await renderComponent({active: false});
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('should render an atomic-icon inside the button', async () => {
    const button = await renderComponent({});
    const icon = button.querySelector('atomic-icon');
    expect(icon?.getAttribute('icon')).toBe(Thumbs);
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    const button = await renderComponent({onClick});

    button.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
