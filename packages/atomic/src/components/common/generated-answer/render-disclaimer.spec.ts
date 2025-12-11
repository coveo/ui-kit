import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderDisclaimerProps,
  renderDisclaimer,
} from './render-disclaimer';

describe('#renderDisclaimer', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderDisclaimerProps> = {}
  ) => {
    const defaultProps: RenderDisclaimerProps = {
      i18n,
      isStreaming: false,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderDisclaimer({props: defaultProps})}`
    );

    return {
      element,
      container: element.querySelector('div'),
      slot: element.querySelector('slot[name="disclaimer"]'),
    };
  };

  describe('when not streaming', () => {
    it('should render the disclaimer container and slot', async () => {
      const {container, slot} = await renderComponent({isStreaming: false});

      expect(container).toBeInTheDocument();
      expect(slot).toBeInTheDocument();
    });

    it('should render the slot with correct name attribute', async () => {
      const {slot} = await renderComponent({isStreaming: false});

      expect(slot).toHaveAttribute('name', 'disclaimer');
    });

    it('should render the default disclaimer text', async () => {
      const {element} = await renderComponent({isStreaming: false});

      await expect
        .element(element)
        .toHaveTextContent(
          'Generated content may contain errors. Verify important information.'
        );
    });
  });

  describe('when streaming', () => {
    it('should not render anything', async () => {
      const {element} = await renderComponent({isStreaming: true});

      expect(element.children.length).toBe(0);
    });

    it('should not render the disclaimer container nor slot', async () => {
      const {container, slot} = await renderComponent({isStreaming: true});

      expect(container).not.toBeInTheDocument();
      expect(slot).not.toBeInTheDocument();
    });

    it('should not render the disclaimer text', async () => {
      const {element} = await renderComponent({isStreaming: true});

      await expect
        .element(element)
        .not.toHaveTextContent('Generative AI can make mistakes');
    });
  });
});
