import {html, render} from 'lit';
import {fireEvent, within} from 'storybook/test';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {type RetryPromptProps, renderRetryPrompt} from './retry-prompt';

describe('#renderRetryPrompt', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderRetry = (
    props: RetryPromptProps
  ): {
    retryContainer: HTMLElement;
    messageElement: HTMLElement;
    button: HTMLButtonElement;
  } => {
    render(html`${renderRetryPrompt({props})}`, container);

    const retryContainer = container.querySelector(
      '[part="retry-container"]'
    ) as HTMLElement;
    const messageElement = retryContainer?.querySelector(
      '.text-neutral-dark'
    ) as HTMLElement;
    const button = within(container).getByRole('button') as HTMLButtonElement;

    return {retryContainer, messageElement, button};
  };

  it('should render the retry container in the document', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {retryContainer} = renderRetry(props);

    expect(retryContainer).toBeInTheDocument();
  });

  it('should render the retry container with the correct part attribute', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {retryContainer} = renderRetry(props);

    expect(retryContainer.getAttribute('part')).toBe('retry-container');
  });

  it('should render the retry container with the correct class', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {retryContainer} = renderRetry(props);

    expect(retryContainer).toHaveClass('mt-4');
  });

  it('should render the message with the correct text', () => {
    const props: RetryPromptProps = {
      message: 'An error occurred',
      buttonLabel: 'Try Again',
      onClick: vi.fn(),
    };

    const {messageElement} = renderRetry(props);

    expect(messageElement.textContent).toBe('An error occurred');
  });

  it('should render the message with the correct classes', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {messageElement} = renderRetry(props);

    expect(messageElement).toHaveClass('text-neutral-dark');
    expect(messageElement).toHaveClass('mx-auto');
    expect(messageElement).toHaveClass('text-center');
  });

  it('should render the button with the correct label', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Click to Retry',
      onClick: vi.fn(),
    };

    const {button} = renderRetry(props);

    expect(button.textContent?.trim()).toBe('Click to Retry');
  });

  it('should render the button with the correct style', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {button} = renderRetry(props);

    expect(button).toHaveClass('btn-outline-primary');
  });

  it('should render the button with the correct classes', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {button} = renderRetry(props);

    expect(button).toHaveClass('mx-auto');
    expect(button).toHaveClass('mt-4');
    expect(button).toHaveClass('block');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  it('should call onClick when the button is clicked', async () => {
    const handleClick = vi.fn();
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Retry',
      onClick: handleClick,
    };

    const {button} = renderRetry(props);

    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with different message text', () => {
    const props: RetryPromptProps = {
      message: 'Network error. Please try again.',
      buttonLabel: 'Retry',
      onClick: vi.fn(),
    };

    const {messageElement} = renderRetry(props);

    expect(messageElement.textContent).toBe('Network error. Please try again.');
  });

  it('should render with different button label', () => {
    const props: RetryPromptProps = {
      message: 'Something went wrong',
      buttonLabel: 'Reload',
      onClick: vi.fn(),
    };

    const {button} = renderRetry(props);

    expect(button.textContent?.trim()).toBe('Reload');
  });
});
