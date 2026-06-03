import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  renderSuggestionsWrapper,
  type SuggestionsWrapperProps,
} from './suggestions-wrapper';

describe('#renderSuggestionsWrapper', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    props: Partial<SuggestionsWrapperProps> = {},
    children = html`<li>Question</li>`
  ) => {
    const element = await renderFunctionFixture(
      html`${renderSuggestionsWrapper({
        props: {
          headingLevel: 2,
          i18n,
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('[part="container"]') as HTMLElement;
  };

  it('should render an aside element with role complementary', async () => {
    const wrapper = await renderComponent();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('aside');
  });

  it('should render with container part', async () => {
    const wrapper = await renderComponent();
    expect(wrapper.getAttribute('part')).toBe('container');
  });

  it('should render heading with correct level', async () => {
    const wrapper = await renderComponent({headingLevel: 3});
    const heading = wrapper.querySelector('h3');
    expect(heading).toBeInTheDocument();
  });

  it('should render heading with correct part', async () => {
    const wrapper = await renderComponent();
    const heading = wrapper.querySelector('[part="heading"]');
    expect(heading).toBeInTheDocument();
  });

  it('should render ul element with questions part', async () => {
    const wrapper = await renderComponent();
    const list = wrapper.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list?.getAttribute('part')).toBe('questions');
  });

  it('should render children inside the ul', async () => {
    const wrapper = await renderComponent({}, html`<li>Custom Question</li>`);
    const list = wrapper.querySelector('ul');
    expect(list?.textContent).toContain('Custom Question');
  });

  it('should have correct aria-label', async () => {
    const wrapper = await renderComponent();
    expect(wrapper.getAttribute('aria-label')).toBe(
      i18n.t('smart-snippet-people-also-ask')
    );
  });
});
