import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderRefineModalSortSection} from './sort';

describe('#renderRefineModalSortSection', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const children = html`
      <option value="relevancy">Relevancy</option>
      <option value="date">Date</option>
    `;
    const element = await renderFunctionFixture(
      html`${renderRefineModalSortSection({
        props: {
          i18n,
          onSelect: () => {},
          ...overrides,
        },
      })(children)}`
    );

    return {
      sectionTitle: element.querySelector('h2[part*="section-sort-title"]'),
      selectWrapper: element.querySelector('div[part="select-wrapper"]'),
      select: element.querySelector('select[part="select"]'),
      selectIconWrapper: element.querySelector(
        'div[part="select-icon-wrapper"]'
      ),
      selectIcon: element.querySelector('atomic-icon[part="select-icon"]'),
      options: element.querySelectorAll('option'),
    };
  };

  it('should render the section title with correct parts', async () => {
    const {sectionTitle} = await renderComponent();

    expect(sectionTitle).toHaveAttribute(
      'part',
      'section-title section-sort-title'
    );
  });

  it('should render the correct title text from i18n', async () => {
    const {sectionTitle} = await renderComponent();

    expect(sectionTitle).toHaveTextContent('Sort');
  });

  it('should render the select wrapper with correct part', async () => {
    const {selectWrapper} = await renderComponent();

    expect(selectWrapper).toHaveAttribute('part', 'select-wrapper');
  });

  it('should render the select element with correct part', async () => {
    const {select} = await renderComponent();

    expect(select).toHaveAttribute('part', 'select');
  });

  it('should set the correct aria-label from i18n', async () => {
    const {select} = await renderComponent();

    expect(select).toHaveAttribute('aria-label', 'Sort by');
  });

  it('should render children options', async () => {
    const {options} = await renderComponent();

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Relevancy');
    expect(options[0]).toHaveValue('relevancy');
    expect(options[1]).toHaveTextContent('Date');
    expect(options[1]).toHaveValue('date');
  });

  it('should call onSelect when select value changes', async () => {
    const onSelect = vi.fn();
    const {select} = await renderComponent({onSelect});

    await userEvent.selectOptions(select!, 'date');

    expect(onSelect).toHaveBeenCalled();
  });

  it('should render the select icon wrapper with correct part', async () => {
    const {selectIconWrapper} = await renderComponent();

    expect(selectIconWrapper).toHaveAttribute('part', 'select-icon-wrapper');
  });

  it('should render the select icon with correct part', async () => {
    const {selectIcon} = await renderComponent();

    expect(selectIcon).toHaveAttribute('part', 'select-icon');
  });

  it('should render the atomic-icon element', async () => {
    const {selectIcon} = await renderComponent();

    expect(selectIcon?.tagName).toBe('ATOMIC-ICON');
  });

  it('should set the icon source to SortIcon', async () => {
    const {selectIcon} = await renderComponent();

    expect(selectIcon?.getAttribute('icon')).toMatch(/<svg/);
  });
});
