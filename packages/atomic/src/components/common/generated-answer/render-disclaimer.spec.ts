import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {DISCLAIMER_ID, type RenderDisclaimerProps, renderDisclaimer} from './render-disclaimer';

describe('#renderDisclaimer', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides: Partial<RenderDisclaimerProps> = {}) => {
    const defaultProps: RenderDisclaimerProps = {
      i18n,
      ...overrides,
    };

    const element = await renderFunctionFixture(html`${renderDisclaimer({props: defaultProps})}`);

    return {
      element,
      container: element.querySelector('small'),
      slot: element.querySelector('slot[name="disclaimer"]'),
    };
  };

  describe('when rendering', () => {
    it('should render the disclaimer container and slot', async () => {
      const {container, slot} = await renderComponent();

      expect(container).toBeInTheDocument();
      expect(slot).toBeInTheDocument();
    });

    it('should render the slot with correct name attribute', async () => {
      const {slot} = await renderComponent();

      expect(slot).toHaveAttribute('name', 'disclaimer');
    });

    it('should render the default disclaimer text', async () => {
      const {element} = await renderComponent();

      await expect
        .element(element)
        .toHaveTextContent(
          'AI-generated content may contain errors. Verify important information.'
        );
    });

    it('should render the disclaimer as small print referenceable by id', async () => {
      const {container} = await renderComponent();

      expect(container).toHaveAttribute('id', DISCLAIMER_ID);
      expect(container?.tagName).toBe('SMALL');
      expect(container).not.toHaveAttribute('role');
    });
  });
});
