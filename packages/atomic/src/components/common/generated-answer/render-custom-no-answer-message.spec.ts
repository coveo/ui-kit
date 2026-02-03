import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderCustomNoAnswerMessageProps,
  renderCustomNoAnswerMessage,
} from './render-custom-no-answer-message';

vi.mock('@/src/components/common/heading', {spy: true});
vi.mock('@/src/components/common/switch', {spy: true});

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
      isAnswerVisible: true,
      toggleTooltip: 'tooltip',
      withToggle: true,
      onToggle: vi.fn(),
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCustomNoAnswerMessage({props: defaultProps})}`
    );

    return {
      element,
      generatedContent: element.querySelector('[part="generated-content"]'),
      header: element.querySelector('[part="header"]'),
      headerIcon: element.querySelector('[part="header-icon"]'),
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
        class: 'text-primary inline-block rounded-md px-2.5 py-2 font-medium',
      }),
    });

    const headerLabel = element.querySelector('[part="header-label"]');
    expect(headerLabel?.textContent?.trim()).toBe(
      i18n.t('generated-answer-title')
    );
  });

  it('should call renderSwitch with correct arguments', async () => {
    const {element} = await renderComponent();

    expect(renderSwitch).toHaveBeenCalledWith({
      props: expect.objectContaining({
        part: 'toggle',
        checked: true,
        ariaLabel: i18n.t('generated-answer-title'),
        title: 'tooltip',
        withToggle: true,
        tabIndex: 0,
      }),
    });

    const toggle = element.querySelector('[part="toggle"]');
    expect(toggle).toBeInTheDocument();
  });

  it('should render a header icon', async () => {
    const {headerIcon} = await renderComponent();
    expect(headerIcon).toBeInTheDocument();
  });

  it('should render the generated content container', async () => {
    const {generatedContent, header} = await renderComponent();

    expect(generatedContent).toBeInTheDocument();
    expect(generatedContent).toHaveAttribute('part', 'generated-content');
    expect(header).toBeInTheDocument();
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
