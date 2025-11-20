import type {i18n} from 'i18next';
import {html, nothing, render} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  renderSmartSnippetFooter,
  type SmartSnippetFooterProps,
} from './smart-snippet-footer';

describe('#renderSmartSnippetFooter', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockI18n = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'smart-snippet-source': 'Source',
        };
        return translations[key] || key;
      }),
    } as unknown as i18n;
  });

  const renderFooter = (
    props: Partial<SmartSnippetFooterProps>,
    children = nothing
  ): HTMLElement => {
    const defaultProps: SmartSnippetFooterProps = {
      i18n: mockI18n,
      ...props,
    };
    render(
      html`${renderSmartSnippetFooter({props: defaultProps})(children)}`,
      container
    );
    return container.querySelector('footer')!;
  };

  it('should render a footer element', () => {
    const footer = renderFooter({});
    expect(footer).toBeInTheDocument();
  });

  it('should render with footer part', () => {
    const footer = renderFooter({});
    expect(footer.getAttribute('part')).toBe('footer');
  });

  it('should render with aria-label', () => {
    const footer = renderFooter({});
    expect(footer.getAttribute('aria-label')).toBe('Source');
  });

  it('should call i18n.t with smart-snippet-source key', () => {
    renderFooter({});
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet-source');
  });

  it('should render children inside the footer', () => {
    const children = html`<p>Footer Content</p>`;
    renderFooter({}, children);
    const footer = container.querySelector('footer');
    expect(footer?.textContent).toContain('Footer Content');
  });
});
