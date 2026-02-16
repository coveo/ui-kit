import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type FooterProps, renderFooter} from './footer';

describe('#renderFooter', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<FooterProps> = {},
    children = html`<a href="#">Source</a>`
  ) => {
    const element = await renderFunctionFixture(
      html`${renderFooter({
        props: {
          i18n,
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('footer') as HTMLElement;
  };

  it('should render a footer element', async () => {
    const footer = await renderComponent();
    expect(footer).toBeInTheDocument();
    expect(footer.tagName.toLowerCase()).toBe('footer');
  });

  it('should render with footer part', async () => {
    const footer = await renderComponent();
    expect(footer.getAttribute('part')).toBe('footer');
  });

  it('should have correct aria-label with translated text', async () => {
    const footer = await renderComponent();
    expect(footer.getAttribute('aria-label')).toBe('Source of the answer');
  });

  it('should render children', async () => {
    const footer = await renderComponent(
      {},
      html`<a href="#">Custom Source</a>`
    );
    expect(footer.textContent).toContain('Custom Source');
  });
});
