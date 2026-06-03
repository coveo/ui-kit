import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  renderRefineModalFiltersClearButton,
  renderRefineModalFiltersSection,
} from './filters';

describe('filters', () => {
  describe('#renderRefineModalFiltersSection', () => {
    let i18n: i18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    const renderComponent = async (overrides = {}) => {
      const children = html`<div class="test-children">Test Children</div>`;
      const element = await renderFunctionFixture(
        html`${renderRefineModalFiltersSection({
          props: {
            i18n,
            withFacets: true,
            withAutomaticFacets: true,
            ...overrides,
          },
        })(children)}`
      );

      return {
        filterSection: element.querySelector('div[part="filter-section"]'),
        sectionTitle: element.querySelector(
          'h2[part*="section-filters-title"]'
        ),
        facetsSlot: element.querySelector('slot[name="facets"]'),
        automaticFacetsSlot: element.querySelector(
          'slot[name="automatic-facets"]'
        ),
        children: element.querySelector('.test-children'),
      };
    };

    it('should render the filter section with correct part', async () => {
      const {filterSection} = await renderComponent();

      expect(filterSection).toHaveAttribute('part', 'filter-section');
    });

    it('should render the section title with correct parts', async () => {
      const {sectionTitle} = await renderComponent();

      expect(sectionTitle).toHaveAttribute(
        'part',
        'section-title section-filters-title'
      );
    });

    it('should render the correct title text from i18n', async () => {
      const {sectionTitle} = await renderComponent();

      expect(sectionTitle).toHaveTextContent('Filters');
    });

    it('should render children content', async () => {
      const {children} = await renderComponent();

      expect(children).toHaveTextContent('Test Children');
    });

    it('should render facets slot when withFacets is true', async () => {
      const {facetsSlot} = await renderComponent({withFacets: true});

      expect(facetsSlot).toHaveAttribute('name', 'facets');
    });

    it('should not render facets slot when withFacets is false', async () => {
      const {facetsSlot} = await renderComponent({withFacets: false});

      expect(facetsSlot).toBeNull();
    });

    it('should render automatic facets slot when withAutomaticFacets is true', async () => {
      const {automaticFacetsSlot} = await renderComponent({
        withAutomaticFacets: true,
      });

      expect(automaticFacetsSlot).toHaveAttribute('name', 'automatic-facets');
    });

    it('should not render automatic facets slot when withAutomaticFacets is false', async () => {
      const {automaticFacetsSlot} = await renderComponent({
        withAutomaticFacets: false,
      });

      expect(automaticFacetsSlot).toBeNull();
    });
  });

  describe('#renderRefineModalFiltersClearButton', () => {
    let i18n: i18n;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    const renderComponent = async (overrides = {}) => {
      const element = await renderFunctionFixture(
        html`${renderRefineModalFiltersClearButton({
          props: {
            i18n,
            onClick: () => {},
            ...overrides,
          },
        })}`
      );

      return {
        button: element.querySelector('button[part="filter-clear-all"]'),
      };
    };

    it('should render a button with the correct part', async () => {
      const {button} = await renderComponent();

      expect(button).toHaveAttribute('part', 'filter-clear-all');
    });

    it('should render the correct text from i18n', async () => {
      const {button} = await renderComponent();

      expect(button).toHaveTextContent('Clear');
    });

    it('should call the onClick function when clicked', async () => {
      const onClick = vi.fn();
      const {button} = await renderComponent({onClick});

      await userEvent.click(button!);

      expect(onClick).toHaveBeenCalled();
    });
  });
});
