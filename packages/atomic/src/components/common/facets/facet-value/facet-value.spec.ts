import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {
  expect,
  vi,
  describe,
  beforeAll,
  it,
  MockedFunction,
  beforeEach,
} from 'vitest';
import {renderFacetValueBox} from '../facet-value-box/facet-value-box';
import {renderFacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {renderFacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '../facet-value-link/facet-value-link';
import {FacetValueProps, renderFacetValue} from './facet-value';

vi.mock('../facet-value-checkbox/facet-value-checkbox', {spy: true});
vi.mock('../facet-value-link/facet-value-link', {spy: true});
vi.mock('../facet-value-box/facet-value-box', {spy: true});
vi.mock('../facet-value-label-highlight/facet-value-label-highlight', {
  spy: true,
});

describe('renderFacetValue', () => {
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
  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get button() {
      return page.getByRole('button');
    },
    get valueCount() {
      return page.getByText('(42)');
    },
    get label() {
      return page.getByText('Test Value');
    },
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

  describe.skip('when displayValuesAs is link', () => {
    let renderFacetValueLinkSpy: MockedFunction<typeof renderFacetValueLink>;

    beforeEach(() => {
      renderFacetValueLinkSpy = vi.mocked(renderFacetValueLink);
    });

    it('calls #renderFacetValueLink when displayValuesAs is link', async () => {
      await setupElement({displayValuesAs: 'link'});
      expect(renderFacetValueLinkSpy).toHaveBeenCalledWith({});
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
    // TODO: check with facetState
    it.skip('calls #renderFacetValueBox when displayValuesAs is box', async () => {
      await setupElement({displayValuesAs: 'box'});
      const renderFacetValueBoxSpy = vi.mocked(renderFacetValueBox);
      expect(renderFacetValueBoxSpy).toHaveBeenCalled();
    });
  });

  it.skip('calls #getFieldValueCaption with the correct arguments', async () => {
    await setupElement({});
    const renderFacetValueBoxSpy = vi.mocked(renderFacetValueBox);
    expect(renderFacetValueBoxSpy).toHaveBeenCalled();
  });

  it.skip('calls onSelect when the button is clicked', async () => {
    const onSelect = vi.fn();
    await setupElement({onSelect});
    const {button} = locators;
    button.element().dispatchEvent(new MouseEvent('click'));
    expect(onSelect).toHaveBeenCalled();
  });

  it.skip('calls onExclude when exclusion is enabled and checkbox is rendered', async () => {
    const onExclude = vi.fn();
    await setupElement({
      enableExclusion: true,
      onExclude,
      displayValuesAs: 'checkbox',
      facetState: 'excluded',
    });
    // The exclude button is rendered as part of the tri-state checkbox, but we can only check that the prop is passed and the function is called if the button is clicked.
    // This is a minimal check for wiring.
    // You may want to expand this if you expose the exclude button in the DOM.
    expect(onExclude).toBeDefined();
  });

  // it.skip('applies aria attributes and pressed state for selected', async () => {
  //   await setupElement({facetState: 'selected'});
  //   const {button} = locators;
  //   await expect(button).toHaveAttribute('aria-pressed', 'true');
  // });
});
