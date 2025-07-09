import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbContainer} from './breadcrumb-container';

describe('#renderBreadcrumbContainer', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbContainer({
        props: {
          isCollapsed: false,
          i18n,
          ...overrides,
        },
      })(html`<span>Breadcrumbs</span>`)}`
    );

    return {
      container: element.querySelector('div[part="container"]'),
      label: element.querySelector('span'),
      listContainer: element.querySelector(
        'div[part="breadcrumb-list-container"]'
      ),
      list: element.querySelector('ul[part="breadcrumb-list"]'),
    };
  };

  it('should have the "container" part on the container', async () => {
    const {container} = await renderComponent();
    expect(container).toHaveAttribute('part', 'container');
  });

  it('should have the "label" part on the label', async () => {
    const {label} = await renderComponent();
    expect(label).toHaveAttribute('part', 'label');
  });

  it('should have the proper text on the label', async () => {
    const {label} = await renderComponent();
    expect(label).toHaveTextContent('Filters:');
  });

  it('should have the "breadcrumb-list-container" part on the list container', async () => {
    const {listContainer} = await renderComponent();
    expect(listContainer).toHaveAttribute('part', 'breadcrumb-list-container');
  });

  it('should have the "breadcrumb-list" part on the list', async () => {
    const {list} = await renderComponent();
    expect(list).toHaveAttribute('part', 'breadcrumb-list');
  });

  describe('when collapsed', () => {
    it('should have the proper classes on the list', async () => {
      const {list} = await renderComponent({isCollapsed: true});
      expect(list).not.toHaveClass('flex-wrap');
      expect(list).toHaveClass('absolute w-full flex-nowrap');
    });
  });

  describe('when not collapsed', () => {
    it('should have the proper classes on the list', async () => {
      const {list} = await renderComponent({isCollapsed: false});
      expect(list).toHaveClass('flex-wrap');
      expect(list).not.toHaveClass('absolute w-full flex-nowrap');
    });
  });

  it('should render the children in the list', async () => {
    const {list} = await renderComponent();
    expect(list).toContainHTML('<span>Breadcrumbs</span>');
  });
});
