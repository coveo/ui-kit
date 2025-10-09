import {html} from 'lit';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';
import {renderFieldsetGroup as renderCommonFieldsetGroup} from '@/src/components/common/fieldset-group';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetValuesGroupProps,
  renderFacetValuesGroup,
} from './facet-values-group';

vi.mock('@/src/components/common/fieldset-group', {spy: true});

describe('#renderFacetValuesGroup', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let renderFieldsetGroupSpy: MockedFunction<typeof renderCommonFieldsetGroup>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    renderFieldsetGroupSpy = vi.mocked(renderCommonFieldsetGroup);
  });

  const renderComponent = (
    props: Partial<FacetValuesGroupProps> = {},
    children = html`<div>Child Content</div>`
  ) => {
    const defaultProps: FacetValuesGroupProps = {
      i18n,
      label: 'no-label',
      query: undefined,
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFacetValuesGroup({props: mergedProps})(children)}`
    );
  };

  it('renders a fieldset group with the correct label when query is undefined', async () => {
    await renderComponent();
    expect(renderFieldsetGroupSpy).toHaveBeenCalledWith({
      props: {
        label: 'Values for the No label facet',
      },
    });
  });

  it('renders a fieldset group with the correct label when query is provided', async () => {
    await renderComponent({query: 'test query', label: 'Test Facet'});
    expect(renderFieldsetGroupSpy).toHaveBeenCalledWith({
      props: {
        label: 'Values found for test query in the Test Facet facet',
      },
    });
  });

  it('renders the children inside the fieldset group when label is provided', async () => {
    await renderComponent({label: 'Test Facet'}, html`<div>Custom Child</div>`);
    expect(renderFieldsetGroupSpy).toHaveBeenCalledWith({
      props: {
        label: 'Values for the Test Facet facet',
      },
    });
  });

  it('renders only the children when label is not provided', async () => {
    await renderComponent({label: undefined}, html`<div>Custom Child</div>`);
    expect(renderFieldsetGroupSpy).not.toHaveBeenCalled();
  });

  it('renders multiple children inside the fieldset group', async () => {
    await renderComponent(
      {label: 'Test Facet'},
      html`
        <div>Child 1</div>
        <div>Child 2</div>
      `
    );
    expect(renderFieldsetGroupSpy).toHaveBeenCalledWith({
      props: {
        label: 'Values for the Test Facet facet',
      },
    });
  });
});
