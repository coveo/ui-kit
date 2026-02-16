import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderCardHeaderProps,
  renderCardHeader,
} from './render-card-header';

vi.mock('@/src/components/common/heading', {spy: true});
vi.mock('@/src/components/common/switch', {spy: true});

describe('#renderCardHeader', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (
    overrides: Partial<RenderCardHeaderProps> = {}
  ) => {
    const defaultProps: RenderCardHeaderProps = {
      i18n,
      isAnswerVisible: true,
      toggleTooltip: 'Toggle answer visibility',
      withToggle: true,
      onToggle: vi.fn(),
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCardHeader({props: defaultProps})}`
    );

    return {
      element,
      props: defaultProps,
      header: element.querySelector('[part="header"]'),
      headerIcon: element.querySelector('[part="header-icon"]'),
      headerLabel: element.querySelector('[part="header-label"]'),
    };
  };

  it('should render the header container', async () => {
    const {header} = await renderComponent();

    expect(header).toBeInTheDocument();
  });

  it('should call renderHeading with correct arguments', async () => {
    await renderComponent();

    expect(renderHeading).toHaveBeenCalledWith({
      props: expect.objectContaining({
        level: 0,
        part: 'header-label',
        class: 'text-primary inline-block rounded-md px-2.5 py-2 font-medium',
      }),
    });
  });

  it('should render the header label with generated answer title', async () => {
    const {headerLabel} = await renderComponent();

    expect(headerLabel?.textContent?.trim()).toBe(
      i18n.t('generated-answer-title')
    );
  });

  it('should render the sparkles header icon', async () => {
    const {headerIcon} = await renderComponent();

    expect(headerIcon).toBeInTheDocument();
    expect(headerIcon).toHaveAttribute('icon', 'assets://sparkles.svg');
  });

  describe('when answer is visible', () => {
    it('should apply border bottom to the header', async () => {
      const {header} = await renderComponent({isAnswerVisible: true});

      expect(header).toHaveClass('border-b-1', 'border-gray-200');
    });
  });

  describe('when answer is not visible', () => {
    it('should not apply border bottom to the header', async () => {
      const {header} = await renderComponent({isAnswerVisible: false});

      expect(header).not.toHaveClass('border-b-1', 'border-gray-200');
    });
  });

  describe('renderSwitch', () => {
    it('should call renderSwitch with correct props', async () => {
      const onToggle = vi.fn();
      const toggleTooltip = 'Custom toggle tooltip';

      await renderComponent({
        isAnswerVisible: true,
        toggleTooltip,
        withToggle: true,
        onToggle,
      });

      expect(renderSwitch).toHaveBeenCalledWith({
        props: expect.objectContaining({
          part: 'toggle',
          checked: true,
          onToggle,
          ariaLabel: i18n.t('generated-answer-title'),
          title: toggleTooltip,
          withToggle: true,
          tabIndex: 0,
        }),
      });
    });

    it('should pass checked as false when answer is not visible', async () => {
      await renderComponent({isAnswerVisible: false});

      expect(renderSwitch).toHaveBeenCalledWith({
        props: expect.objectContaining({
          checked: false,
        }),
      });
    });

    it('should pass withToggle prop to renderSwitch', async () => {
      await renderComponent({withToggle: false});

      expect(renderSwitch).toHaveBeenCalledWith({
        props: expect.objectContaining({
          withToggle: false,
        }),
      });
    });

    it('should pass the custom toggle tooltip to renderSwitch', async () => {
      const customTooltip = 'My custom tooltip';
      await renderComponent({toggleTooltip: customTooltip});

      expect(renderSwitch).toHaveBeenCalledWith({
        props: expect.objectContaining({
          title: customTooltip,
        }),
      });
    });

    it('should pass the onToggle callback to renderSwitch', async () => {
      const onToggle = vi.fn();
      await renderComponent({onToggle});

      expect(renderSwitch).toHaveBeenCalledWith({
        props: expect.objectContaining({
          onToggle,
        }),
      });
    });
  });
});
