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
import {renderFacetValueBox} from '@/src/components/common/facets/facet-value-box/facet-value-box';
import {renderFacetValueCheckbox} from '@/src/components/common/facets/facet-value-checkbox/facet-value-checkbox';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type FacetValueProps, renderFacetValue} from './facet-value';

vi.mock(
  '@/src/components/common/facets/facet-value-checkbox/facet-value-checkbox',
  {spy: true}
);
vi.mock('@/src/components/common/facets/facet-value-link/facet-value-link', {
  spy: true,
});
vi.mock('@/src/components/common/facets/facet-value-box/facet-value-box', {
  spy: true,
});
vi.mock(
  '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight',
  {
    spy: true,
  }
);

describe('#renderFacetValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let testProps: typeof baseProps & {
    i18n: Awaited<ReturnType<typeof createTestI18n>>;
  };
  const baseProps = {
    field: 'author',
    facetValue: 'Test Value',
    facetCount: 42,
    facetState: 'idle' as const,
    i18n: undefined as unknown as Awaited<ReturnType<typeof createTestI18n>>,
    enableExclusion: false,
    onExclude: vi.fn(),
    onSelect: vi.fn(),
    displayValuesAs: 'checkbox' as const,
    facetSearchQuery: '',
    setRef: vi.fn(),
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
    testProps = {...baseProps, i18n};
  });

  const setupElement = async (props: Partial<FacetValueProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderFacetValue({props: {...testProps, ...props}})}`
    );
  };

  describe('when displayValuesAs is checkbox', () => {
    let renderFacetValueCheckboxSpy: MockedFunction<
      typeof renderFacetValueCheckbox
    >;

    beforeEach(() => {
      renderFacetValueCheckboxSpy = vi.mocked(renderFacetValueCheckbox);
    });

    it('calls #renderFacetValueCheckbox with default arguments', async () => {
      await setupElement();
      expect(renderFacetValueCheckboxSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          displayValue: 'Test Value',
          numberOfResults: 42,
          isSelected: false,
          onClick: testProps.onSelect,
          searchQuery: '',
        }),
      });
    });

    describe('when enableExclusion is true', () => {
      it('calls #renderFacetValueCheckbox with isSelected to true', async () => {
        const onExclude = vi.fn();
        const facetState = 'excluded';
        await setupElement({enableExclusion: true, facetState, onExclude});
        expect(renderFacetValueCheckboxSpy).toHaveBeenCalledWith({
          props: expect.objectContaining({
            onExclude,
            state: facetState,
          }),
        });
      });
    });

    describe('when facetState is selected', () => {
      it('calls #renderFacetValueCheckbox with isSelected to true', async () => {
        await setupElement({facetState: 'selected'});
        expect(renderFacetValueCheckboxSpy).toHaveBeenCalledWith({
          props: expect.objectContaining({
            isSelected: true,
          }),
        });
      });
    });

    describe('when facetSearchQuery is not empty', () => {
      it('calls #renderFacetValueCheckbox with appropriate search query', async () => {
        await setupElement({facetSearchQuery: 'hello there'});
        expect(renderFacetValueCheckboxSpy).toHaveBeenCalledWith({
          props: expect.objectContaining({
            searchQuery: 'hello there',
          }),
        });
      });
    });

    it('calls #renderFacetValueLabelHighlight with the correct arguments', async () => {
      const renderFacetValueLabelHighlightSpy = vi.mocked(
        renderFacetValueLabelHighlight
      );
      await setupElement();
      expect(renderFacetValueLabelHighlightSpy).toHaveBeenCalledWith({
        props: {
          displayValue: 'Test Value',
          isSelected: false,
          isExcluded: false,
          searchQuery: '',
        },
      });
    });
  });

  describe('when displayValuesAs is link', () => {
    let renderFacetValueLinkSpy: MockedFunction<typeof renderFacetValueLink>;

    beforeEach(() => {
      renderFacetValueLinkSpy = vi.mocked(renderFacetValueLink);
    });

    it('calls #renderFacetValueLink with the correct arguments', async () => {
      await setupElement({displayValuesAs: 'link'});
      expect(renderFacetValueLinkSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          displayValue: 'Test Value',
          numberOfResults: 42,
          isSelected: false,
          searchQuery: '',
        }),
      });
    });

    it('calls #renderFacetValueLabelHighlight with the correct arguments', async () => {
      const renderFacetValueLabelHighlightSpy = vi.mocked(
        renderFacetValueLabelHighlight
      );
      await setupElement({displayValuesAs: 'link'});
      expect(renderFacetValueLabelHighlightSpy).toHaveBeenCalledWith({
        props: {
          displayValue: 'Test Value',
          isSelected: false,
          searchQuery: '',
        },
      });
    });
  });

  describe('when displayValuesAs is box', () => {
    it('calls #renderFacetValueBox with the correct arguments', async () => {
      await setupElement({displayValuesAs: 'box'});
      const renderFacetValueBoxSpy = vi.mocked(renderFacetValueBox);
      expect(renderFacetValueBoxSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          displayValue: 'Test Value',
          numberOfResults: 42,
          isSelected: false,
          searchQuery: '',
        }),
      });
    });
  });

  it('calls onExclude when exclusion is enabled and checkbox is rendered', async () => {
    const onExclude = vi.fn();
    const renderFacetValueCheckboxSpy = vi.mocked(renderFacetValueCheckbox);
    await setupElement({
      enableExclusion: true,
      onExclude,
      displayValuesAs: 'checkbox',
      facetState: 'excluded',
    });
    expect(renderFacetValueCheckboxSpy).toHaveBeenCalledWith({
      props: expect.objectContaining({
        onExclude,
      }),
    });
  });
});
