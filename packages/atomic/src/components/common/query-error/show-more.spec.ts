import type {i18n} from 'i18next';
import {html, nothing, type TemplateResult} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderQueryErrorShowMore} from './show-more';

describe('#renderQueryErrorShowMore', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    onShowMore = vi.fn(),
    link: TemplateResult | typeof nothing = nothing
  ) => {
    const element = await renderFunctionFixture(
      html`${renderQueryErrorShowMore({props: {onShowMore, i18n, link}})}`
    );

    return {
      button: element.querySelector('button[part="more-info-btn"]'),
      link: element.querySelector('a[part="doc-link"]'),
    };
  };

  it('should render the button with the "more-info-btn" part when no link is provided', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('part', 'more-info-btn');
  });

  it('should render the button with the proper text when no link is provided', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveTextContent('Learn more');
  });

  it('should call onShowMore when button is clicked', async () => {
    const mockOnShowMore = vi.fn();
    const {button} = await renderComponent(mockOnShowMore);

    (button as HTMLButtonElement)?.click();

    expect(mockOnShowMore).toHaveBeenCalledOnce();
  });

  it('should render the link when link prop is provided', async () => {
    const linkTemplate = html`<a href="https://example.com" part="doc-link"
      >Test Link</a
    >`;
    const {link} = await renderComponent(vi.fn(), linkTemplate);

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('Test Link');
  });

  it('should not render button when link prop is provided', async () => {
    const linkTemplate = html`<a href="https://example.com" part="doc-link"
      >Test Link</a
    >`;
    const {button} = await renderComponent(vi.fn(), linkTemplate);

    expect(button).toBeNull();
  });
});
