import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type RetryPromptProps, renderRetryPrompt} from './retry-prompt';

describe('#renderRetryPrompt', () => {
  const locators = (element: Element) => ({
    get retryContainer() {
      return element.querySelector('[part="retry-container"]');
    },
    get messageElement() {
      return element.querySelector('.text-neutral-dark');
    },
    get button() {
      return element.querySelector('button');
    },
  });

  const renderComponent = async (props: Partial<RetryPromptProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderRetryPrompt({
        props: {
          message: 'Something went wrong',
          buttonLabel: 'Retry',
          onClick: vi.fn(),
          ...props,
        },
      })}`
    );
  };

  it('should render the retry container with the correct part attribute', async () => {
    const element = await renderComponent();
    const {retryContainer} = locators(element);

    expect(retryContainer).toBeInTheDocument();
    expect(retryContainer).toHaveAttribute('part', 'retry-container');
  });

  it('should call onClick when the button is clicked', async () => {
    const handleClick = vi.fn();
    const element = await renderComponent({
      onClick: handleClick,
    });
    const {button} = locators(element);

    (button as HTMLButtonElement).click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with different message text', async () => {
    const element = await renderComponent({
      message: 'Network error. Please try again.',
    });
    const {messageElement} = locators(element);

    expect(messageElement).toHaveTextContent(
      'Network error. Please try again.'
    );
  });

  it('should render with different button label', async () => {
    const element = await renderComponent({
      buttonLabel: 'Reload',
    });
    const {button} = locators(element);

    expect(button).toHaveTextContent('Reload');
  });
});
