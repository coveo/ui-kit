import {html, type TemplateResult} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type NumericFacetValuesContainerProps,
  renderNumericFacetValuesGroup,
} from './values-container';

vi.mock(
  '@/src/components/common/facets/facet-values-group/facet-values-group',
  {spy: true}
);

describe('#renderNumericFacetValuesGroup', async () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let defaultProps: NumericFacetValuesContainerProps;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(async () => {
    defaultProps = {
      i18n,
      label: 'Price',
    };

    vi.mocked(renderFacetValuesGroup).mockReturnValue(
      (children) =>
        html`<div data-testid="facet-values-group">${children}</div>`
    );
  });

  const renderComponent = async (
    props: Partial<NumericFacetValuesContainerProps> = {},
    children = html`<li>Test Child</li>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    const component = renderNumericFacetValuesGroup({props: mergedProps});
    const result = component(children) as TemplateResult;
    const container = await renderFunctionFixture(result);

    return {
      ul: container.querySelector('ul'),
      customChildren: container.querySelectorAll('[data-testid^="child-"]'),
    };
  };

  it('should call renderFacetValuesGroup with correct props', async () => {
    await renderComponent();
    expect(renderFacetValuesGroup).toHaveBeenCalledWith({
      props: {
        i18n,
        label: 'Price',
      },
    });
  });

  it('should render ul with correct part attribute', async () => {
    const {ul} = await renderComponent();
    expect(ul).toHaveAttribute('part', 'values');
  });

  it('should render the correct number of children when rendering with custom children', async () => {
    const {customChildren} = await renderComponent(
      {},
      html`<li data-testid="child-1">Child 1</li>
        <li data-testid="child-2">Child 2</li>`
    );
    expect(customChildren).toHaveLength(2);
    expect(customChildren[0]).toHaveTextContent('Child 1');
    expect(customChildren[1]).toHaveTextContent('Child 2');
  });

  it('should call renderFacetValuesGroup with custom label', async () => {
    await renderComponent({label: 'Custom Label'});
    expect(renderFacetValuesGroup).toHaveBeenCalledWith({
      props: {
        i18n,
        label: 'Custom Label',
      },
    });
  });

  it('should call renderFacetValuesGroup with empty label', async () => {
    await renderComponent({label: ''});
    expect(renderFacetValuesGroup).toHaveBeenCalledWith({
      props: {
        i18n,
        label: '',
      },
    });
  });
});
