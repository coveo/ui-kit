import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderLabel} from './label';

describe('#renderLabel', () => {
  const renderComponent = async () => {
    const element = await renderFunctionFixture(
      html`${renderLabel()(html`children`)}`
    );

    return {
      span: element.querySelector('span[part="label"]'),
    };
  };

  it('should render the part "label" on the span', async () => {
    const {span} = await renderComponent();

    expect(span).toHaveAttribute('part', 'label');
  });

  it('should render the aria-hidden attribute on the span', async () => {
    const {span} = await renderComponent();

    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render the children inside the span', async () => {
    const {span} = await renderComponent();

    expect(span).toHaveTextContent('children');
  });
});
