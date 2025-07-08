import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import '@vitest/browser/matchers.d.ts';
import {html, type TemplateResult} from 'lit';
import {vi, expect, describe, beforeAll, beforeEach, it} from 'vitest';
import {renderFacetValuesGroup} from '../facet-values-group/facet-values-group';
import {
  renderNumericFacetValuesGroup,
  type NumericFacetValuesContainerProps,
} from './values-container';

vi.mock('../facet-values-group/facet-values-group', {spy: true});

describe('#renderNumericFacetValuesGroup', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let defaultProps: NumericFacetValuesContainerProps;
  let element: Element;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(async () => {
    defaultProps = {
      i18n,
      label: 'Price',
    };

    vi.clearAllMocks();

    // Mock renderFacetValuesGroup to return a function that wraps children
    vi.mocked(renderFacetValuesGroup).mockReturnValue(
      (children) =>
        html`<div data-testid="facet-values-group">${children}</div>`
    );

    // Render default component for most tests
    element = await renderComponent();
  });

  const renderComponent = async (
    props: Partial<NumericFacetValuesContainerProps> = {},
    children = html`<li>Test Child</li>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    const component = renderNumericFacetValuesGroup({props: mergedProps});
    const result = component(children) as TemplateResult;
    return await renderFunctionFixture(result);
  };

  it('should call renderFacetValuesGroup with correct props', () => {
    expect(renderFacetValuesGroup).toHaveBeenCalledWith({
      props: {
        i18n,
        label: 'Price',
      },
    });
  });

  it('should render a ul element', () => {
    const ulElement = element.querySelector('ul');
    expect(ulElement).toBeInTheDocument();
  });

  it('should render ul with correct class attribute', () => {
    const ulElement = element.querySelector('ul');
    expect(ulElement).toHaveClass('mt-3');
  });

  it('should render ul with correct part attribute', () => {
    const ulElement = element.querySelector('ul');
    expect(ulElement).toHaveAttribute('part', 'values');
  });

  it('should render ul with correct part attribute', () => {
    const ulElement = element.querySelector('ul');
    expect(ulElement).toHaveAttribute('part', 'values');
  });

  describe('when rendering with custom children', () => {
    let customElement: Element;

    beforeEach(async () => {
      const children = html`<li data-testid="child-1">Child 1</li>
        <li data-testid="child-2">Child 2</li>`;
      customElement = await renderComponent({}, children);
    });

    it('should render the correct number of children', () => {
      const childElements = customElement.querySelectorAll(
        '[data-testid^="child-"]'
      );
      expect(childElements).toHaveLength(2);
    });

    it('should render first child with correct content', () => {
      const childElements = customElement.querySelectorAll(
        '[data-testid^="child-"]'
      );
      expect(childElements[0]).toHaveTextContent('Child 1');
    });

    it('should render second child with correct content', () => {
      const childElements = customElement.querySelectorAll(
        '[data-testid^="child-"]'
      );
      expect(childElements[1]).toHaveTextContent('Child 2');
    });
  });

  describe('when called once', () => {
    it('should call renderFacetValuesGroup exactly once', () => {
      expect(renderFacetValuesGroup).toHaveBeenCalledTimes(1);
    });

    it('should return a function from renderFacetValuesGroup', () => {
      const groupFunction = vi.mocked(renderFacetValuesGroup).mock.results[0]
        .value;
      expect(typeof groupFunction).toBe('function');
    });
  });

  describe('when rendering with empty children', () => {
    let emptyElement: Element;

    beforeEach(async () => {
      emptyElement = await renderComponent({}, html``);
    });

    it('should render ul element', () => {
      const ulElement = emptyElement.querySelector('ul');
      expect(ulElement).toBeInTheDocument();
    });

    it('should have no children in ul', () => {
      const ulElement = emptyElement.querySelector('ul');
      expect(ulElement?.children).toHaveLength(0);
    });
  });

  describe('when rendering with custom label', () => {
    beforeEach(async () => {
      await renderComponent({label: 'Custom Label'});
    });

    it('should call renderFacetValuesGroup with custom label', () => {
      expect(renderFacetValuesGroup).toHaveBeenCalledWith({
        props: {
          i18n,
          label: 'Custom Label',
        },
      });
    });
  });

  describe('when rendering with empty label', () => {
    beforeEach(async () => {
      await renderComponent({label: ''});
    });

    it('should call renderFacetValuesGroup with empty label', () => {
      expect(renderFacetValuesGroup).toHaveBeenCalledWith({
        props: {
          i18n,
          label: '',
        },
      });
    });
  });

  it('should return a function that accepts children', () => {
    const component = renderNumericFacetValuesGroup({props: defaultProps});
    expect(typeof component).toBe('function');
  });

  it('should return a defined result when called with children', () => {
    const component = renderNumericFacetValuesGroup({props: defaultProps});
    const children = html`<li>Test</li>`;
    const result = component(children);
    expect(result).toBeDefined();
  });

  describe('integration with renderFacetValuesGroup', () => {
    let integrationElement: Element;

    beforeEach(async () => {
      // Reset the mock to return the actual structure
      vi.mocked(renderFacetValuesGroup).mockReturnValue(
        (children) =>
          html`<fieldset data-testid="fieldset">${children}</fieldset>`
      );
      integrationElement = await renderComponent();
    });

    it('should render fieldset wrapper', () => {
      const fieldset = integrationElement.querySelector(
        '[data-testid="fieldset"]'
      );
      expect(fieldset).toBeInTheDocument();
    });

    it('should render ul inside fieldset', () => {
      const fieldset = integrationElement.querySelector(
        '[data-testid="fieldset"]'
      );
      const ul = fieldset?.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });

    it('should maintain ul part attribute in nested structure', () => {
      const fieldset = integrationElement.querySelector(
        '[data-testid="fieldset"]'
      );
      const ul = fieldset?.querySelector('ul');
      expect(ul).toHaveAttribute('part', 'values');
    });
  });

  describe('functional component pattern', () => {
    it('should return a function when called with props', () => {
      const component = renderNumericFacetValuesGroup({props: defaultProps});
      expect(typeof component).toBe('function');
    });

    it('should return an object when function is called with children', () => {
      const component = renderNumericFacetValuesGroup({props: defaultProps});
      const children = html`<li>Test</li>`;
      const result = component(children);
      expect(typeof result).toBe('object');
    });

    it('should return a defined result when curried', () => {
      const componentWithProps = renderNumericFacetValuesGroup({
        props: defaultProps,
      });
      const children = html`<li>Test Item</li>`;
      const finalResult = componentWithProps(children);
      expect(finalResult).toBeDefined();
    });
  });
});
