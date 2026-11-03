import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  DISCLAIMER_ID,
  getDisclaimerText,
  type RenderDisclaimerProps,
  renderDisclaimer,
} from './render-disclaimer';

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
      container: element.querySelector('div'),
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

    it('should expose the disclaimer as a note referenceable by id', async () => {
      const {container} = await renderComponent();

      expect(container).toHaveAttribute('id', DISCLAIMER_ID);
      expect(container).toHaveAttribute('role', 'note');
      expect(container).toHaveAttribute('part', 'disclaimer');
    });
  });

  describe('#getDisclaimerText', () => {
    it('should return the default disclaimer when no disclaimer slot content is provided', () => {
      const host = document.createElement('div');

      expect(getDisclaimerText(host, i18n)).toBe(
        'AI-generated content may contain errors. Verify important information.'
      );
    });

    it('should return the text of the disclaimer slot content when provided', () => {
      const host = document.createElement('div');
      host.innerHTML = '<p>Unrelated</p><span slot="disclaimer"> Custom AI disclaimer. </span>';

      expect(getDisclaimerText(host, i18n)).toBe('Custom AI disclaimer.');
    });
  });
});
