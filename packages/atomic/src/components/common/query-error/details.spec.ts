import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderQueryErrorDetails} from './details';

describe('#renderQueryErrorDetails', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorDetails({
        props: {
          error: {type: 'test-error', message: 'Test error message'},
          show: true,
          ...overrides,
        },
      })}`
    );

    return {
      preElement: element.querySelector('pre[part="error-info"]'),
      codeElement: element.querySelector('code'),
    };
  };

  it('should render the pre element with correct part', async () => {
    const {preElement} = await renderComponent();

    expect(preElement).toHaveAttribute('part', 'error-info');
  });

  it('should render the error object as JSON string', async () => {
    const error = {type: 'test-error', message: 'Test error message'};
    const {codeElement} = await renderComponent({error});

    expect(codeElement).toHaveTextContent(
      '{ "type": "test-error", "message": "Test error message" }'
    );
  });

  it('should render nothing when show is false', async () => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorDetails({
        props: {
          error: {type: 'test-error'},
          show: false,
        },
      })}`
    );

    expect(element.textContent?.trim()).toBe('');
  });
});
