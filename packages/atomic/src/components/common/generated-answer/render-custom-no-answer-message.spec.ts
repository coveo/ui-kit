import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderHeading} from '@/src/components/common/heading';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderCustomNoAnswerMessageProps,
  renderCustomNoAnswerMessage,
} from './render-custom-no-answer-message';

vi.mock('@/src/components/common/heading', {spy: true});

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
      generatedContent: element.querySelector('[part="generated-content"]'),
      generatedContainer: element.querySelector('[part="generated-container"]'),
      slot: element.querySelector('slot[name="no-answer-message"]'),
    };
  };

  it('should call renderHeading with correct arguments', async () => {
    const {element} = await renderComponent();

    expect(renderHeading).toHaveBeenCalledWith({
      props: expect.objectContaining({
        level: 0,
        part: 'header-label',
        class:
          'text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium',
      }),
    });

    const headerLabel = element.querySelector('[part="header-label"]');
    expect(headerLabel?.textContent?.trim()).toBe(
      i18n.t('generated-answer-title')
    );
  });

  it('should render the generated content container', async () => {
    const {generatedContent} = await renderComponent();

    expect(generatedContent).toBeInTheDocument();
    expect(generatedContent).toHaveAttribute('part', 'generated-content');
  });

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

  it('should render with proper layout structure', async () => {
    const {generatedContent, generatedContainer} = await renderComponent();

    expect(generatedContent).toContainElement(
      generatedContainer as HTMLElement
    );
  });
});
