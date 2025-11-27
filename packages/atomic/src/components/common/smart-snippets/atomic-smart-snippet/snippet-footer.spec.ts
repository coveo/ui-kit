import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderSnippetFooter, type SnippetFooterProps} from './snippet-footer';

describe('#renderSnippetFooter', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<SnippetFooterProps> = {},
    children = html``
  ) => {
    const element = await renderFunctionFixture(
      html`${renderSnippetFooter({
        props: {
          i18n,
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('footer') as HTMLElement;
  };

  it('should render a footer element', async () => {
    const footer = await renderComponent({});
    expect(footer).toBeInTheDocument();
  });

  it('should render with footer part', async () => {
    const footer = await renderComponent({});
    expect(footer.getAttribute('part')).toBe('footer');
  });

  it('should render with aria-label', async () => {
    const footer = await renderComponent({});
    expect(footer.getAttribute('aria-label')).toBe(
      i18n.t('smart-snippet-source')
    );
  });

  it('should render children inside the footer', async () => {
    const children = html`<p>Footer Content</p>`;
    const footer = await renderComponent({}, children);
    expect(footer?.textContent).toContain('Footer Content');
  });
});
