import type {i18n} from 'i18next';
import {html, nothing, render} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  renderSmartSnippetWrapper,
  type SmartSnippetWrapperProps,
} from './smart-snippet-wrapper';

describe('#renderSmartSnippetWrapper', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockI18n = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'smart-snippet': 'Smart Snippet',
        };
        return translations[key] || key;
      }),
    } as unknown as i18n;
  });

  const renderWrapper = (
    props: Partial<SmartSnippetWrapperProps>,
    children = nothing
  ): HTMLElement => {
    const defaultProps: SmartSnippetWrapperProps = {
      i18n: mockI18n,
      headingLevel: undefined,
      ...props,
    };
    render(
      html`${renderSmartSnippetWrapper({props: defaultProps})(children)}`,
      container
    );
    return container.querySelector('aside')!;
  };

  it('should render an aside element with aria-label', () => {
    const aside = renderWrapper({});
    expect(aside).toBeInTheDocument();
    expect(aside.getAttribute('aria-label')).toBe('Smart Snippet');
  });

  it('should render an article element with the smart-snippet part', () => {
    renderWrapper({});
    const article = container.querySelector('article[part="smart-snippet"]');
    expect(article).toBeInTheDocument();
  });

  it('should render with background and border classes', () => {
    renderWrapper({});
    const article = container.querySelector('article');
    expect(article).toHaveClass('bg-background');
    expect(article).toHaveClass('border-neutral');
    expect(article).toHaveClass('text-on-background');
    expect(article).toHaveClass('rounded-lg');
    expect(article).toHaveClass('border');
  });

  it('should render a heading with sr-only class', () => {
    renderWrapper({});
    const heading = container.querySelector('.sr-only');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent?.trim()).toBe('Smart Snippet');
  });

  it('should render heading with level 0 when headingLevel is undefined', () => {
    renderWrapper({headingLevel: undefined});
    const heading = container.querySelector('div.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render heading with specified level', () => {
    renderWrapper({headingLevel: 2});
    const heading = container.querySelector('h2.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render children inside the article', () => {
    const children = html`<p>Test Content</p>`;
    renderWrapper({}, children);
    const article = container.querySelector('article');
    expect(article?.textContent).toContain('Test Content');
  });

  it('should call i18n.t with smart-snippet key', () => {
    renderWrapper({});
    expect(mockI18n.t).toHaveBeenCalledWith('smart-snippet');
  });
});
