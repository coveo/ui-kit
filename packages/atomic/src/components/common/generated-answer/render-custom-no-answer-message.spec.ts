import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderCustomNoAnswerMessageProps,
  renderCustomNoAnswerMessage,
} from './render-custom-no-answer-message';

describe('#renderCustomNoAnswerMessage', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderCustomNoAnswerMessageProps> = {}
  ) => {
    const defaultProps: RenderCustomNoAnswerMessageProps = {
      i18n,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCustomNoAnswerMessage({props: defaultProps})}`
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
