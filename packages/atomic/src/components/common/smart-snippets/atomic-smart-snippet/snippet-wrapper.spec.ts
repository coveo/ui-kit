import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  renderSnippetWrapper,
  type SnippetWrapperProps,
} from './snippet-wrapper';

describe('#renderSnippetWrapper', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<SnippetWrapperProps> = {},
    children = html``
  ) => {
    const element = await renderFunctionFixture(
      html`${renderSnippetWrapper({
        props: {
          i18n,
          headingLevel: undefined,
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('aside') as HTMLElement;
  };

  it('should render an aside element with aria-label', async () => {
    const aside = await renderComponent({});
    expect(aside).toBeInTheDocument();
    expect(aside.getAttribute('aria-label')).toBe(i18n.t('smart-snippet'));
  });

  it('should render an article element with the smart-snippet part', async () => {
    const aside = await renderComponent({});
    const article = aside.querySelector('article[part="smart-snippet"]');
    expect(article).toBeInTheDocument();
  });

  it('should render with background and border classes', async () => {
    const aside = await renderComponent({});
    const article = aside.querySelector('article');
    expect(article).toHaveClass('bg-background');
    expect(article).toHaveClass('border-neutral');
    expect(article).toHaveClass('text-on-background');
    expect(article).toHaveClass('rounded-lg');
    expect(article).toHaveClass('border');
  });

  it('should render a heading with sr-only class', async () => {
    const aside = await renderComponent({});
    const heading = aside.querySelector('.sr-only');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent?.trim()).toBe(i18n.t('smart-snippet'));
  });

  it('should render heading with level 0 when headingLevel is undefined', async () => {
    const aside = await renderComponent({headingLevel: undefined});
    const heading = aside.querySelector('div.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render heading with specified level', async () => {
    const aside = await renderComponent({headingLevel: 2});
    const heading = aside.querySelector('h2.sr-only');
    expect(heading).toBeInTheDocument();
  });

  it('should render children inside the article', async () => {
    const children = html`<p>Test Content</p>`;
    const aside = await renderComponent({}, children);
    const article = aside.querySelector('article');
    expect(article?.textContent).toContain('Test Content');
  });
});
