import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderCustomNoAnswerMessage} from './render-custom-no-answer-message';

describe('#renderCustomNoAnswerMessage', () => {
  const renderComponent = async () => {
    const element = await renderFunctionFixture(
      html`${renderCustomNoAnswerMessage()}`
    );

    return {
      element,
      generatedContainer: element.querySelector('[part="generated-container"]'),
      slot: element.querySelector('slot[name="no-answer-message"]'),
    };
  };

  it('should render the generated container with correct attributes', async () => {
    const {generatedContainer} = await renderComponent();

    expect(generatedContainer).toBeInTheDocument();
    expect(generatedContainer).toHaveAttribute('part', 'generated-container');
  });

  it('should render the no-answer-message slot', async () => {
    const {slot} = await renderComponent();

    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute('name', 'no-answer-message');
  });

  it('should render slot inside the generated container', async () => {
    const {generatedContainer, slot} = await renderComponent();

    expect(generatedContainer).toContainElement(slot as HTMLElement);
  });
});
