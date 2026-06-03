import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderFacetPlaceholder} from './facet-placeholder';

interface FacetPlaceholderProps {
  numberOfValues: number;
  isCollapsed: boolean;
}

describe('#renderFacetPlaceholder', () => {
  const locators = (element: Element) => ({
    get placeholder() {
      return element.querySelector('[part="placeholder"]');
    },
    get header() {
      return element.querySelector('[part="placeholder"] > div:first-child');
    },
    get valuesContainer() {
      return element.querySelector('[part="placeholder"] > div.mt-7');
    },
    get facetValues() {
      return element.querySelectorAll('[part="placeholder"] > div.mt-7 > div');
    },
  });

  const renderComponent = async (
    props: Partial<FacetPlaceholderProps> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderFacetPlaceholder({
        props: {
          numberOfValues: 5,
          isCollapsed: false,
          ...props,
        },
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render placeholder container with correct part', async () => {
    const element = await renderComponent();
    const placeholder = locators(element).placeholder;

    expect(placeholder).not.toBeNull();
    expect(placeholder?.tagName).toBe('DIV');
    expect(placeholder?.part).toContain('placeholder');
  });

  it('should render placeholder with aria-hidden attribute', async () => {
    const element = await renderComponent();
    const placeholder = locators(element).placeholder;

    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render header bar with correct styling', async () => {
    const element = await renderComponent();
    const header = locators(element).header;

    expect(header).not.toBeNull();
    expect(header?.tagName).toBe('DIV');
  });

  describe('when isCollapsed is false', () => {
    it('should render facet values container', async () => {
      const element = await renderComponent({isCollapsed: false});
      const valuesContainer = locators(element).valuesContainer;

      expect(valuesContainer).not.toBeNull();
      expect(valuesContainer?.tagName).toBe('DIV');
    });

    it('should render correct number of facet value placeholders', async () => {
      const element = await renderComponent({
        numberOfValues: 3,
        isCollapsed: false,
      });
      const facetValues = locators(element).facetValues;

      expect(facetValues).toHaveLength(3);
    });

    it('should render facet value placeholders correctly', async () => {
      const element = await renderComponent({
        numberOfValues: 1,
        isCollapsed: false,
      });
      const facetValue = locators(element).facetValues[0];

      expect(facetValue).not.toBeNull();
      expect(facetValue?.tagName).toBe('DIV');
    });

    it('should render no facet value placeholders when numberOfValues is 0', async () => {
      const element = await renderComponent({
        numberOfValues: 0,
        isCollapsed: false,
      });
      const facetValues = locators(element).facetValues;

      expect(facetValues).toHaveLength(0);
    });
  });

  describe('when isCollapsed is true', () => {
    it('should not render facet values container', async () => {
      const element = await renderComponent({isCollapsed: true});
      const valuesContainer = locators(element).valuesContainer;

      expect(valuesContainer).toBeNull();
    });

    it('should not render any facet value placeholders', async () => {
      const element = await renderComponent({
        numberOfValues: 5,
        isCollapsed: true,
      });
      const facetValues = locators(element).facetValues;

      expect(facetValues).toHaveLength(0);
    });

    it('should still render header bar when collapsed', async () => {
      const element = await renderComponent({isCollapsed: true});
      const header = locators(element).header;

      expect(header).not.toBeNull();
      expect(header?.tagName).toBe('DIV');
    });
  });

  it('should render correctly when toggling between collapsed states', async () => {
    const expandedElement = await renderComponent({
      numberOfValues: 3,
      isCollapsed: false,
    });
    const expandedValues = locators(expandedElement).facetValues;
    expect(expandedValues).toHaveLength(3);

    const collapsedElement = await renderComponent({
      numberOfValues: 3,
      isCollapsed: true,
    });
    const collapsedValues = locators(collapsedElement).facetValues;
    expect(collapsedValues).toHaveLength(0);
  });
});
