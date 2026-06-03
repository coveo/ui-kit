import {html} from 'lit';
import {createRef} from 'lit/directives/ref.js';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderCheckbox} from '@/src/components/common/checkbox';
import type {FacetValuePropsBase} from '@/src/components/common/facets/facet-common';
import {renderFacetValueExclude} from '@/src/components/common/facets/facet-value-exclude/facet-value-exclude';
import {renderTriStateCheckbox} from '@/src/components/common/triStateCheckbox';
import {createRipple} from '@/src/utils/ripple-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  renderFacetValueCheckbox,
  type TriStateFacetValueProps,
} from './facet-value-checkbox';

vi.mock('@/src/components/common/triStateCheckbox', {spy: true});
vi.mock('@/src/components/common/checkbox', {spy: true});
vi.mock(
  '@/src/components/common/facets/facet-value-exclude/facet-value-exclude',
  {spy: true}
);
vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('#renderFacetValueCheckbox', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });
  const setupElement = async (
    props?: Partial<FacetValuePropsBase | TriStateFacetValueProps>
  ) => {
    const element = await renderFunctionFixture(
      html`${renderFacetValueCheckbox({
        props: {
          displayValue: 'Test Value',
          numberOfResults: 42,
          isSelected: false,
          i18n,
          onClick: vi.fn(),
          buttonRef: vi.fn(),
          ...props,
        },
      })(html`Some Value Label`)}`
    );
    return {
      element,
      listItem: page.getByRole('listitem'),
      checkbox: page.getByRole('checkbox'),
      triStateCheckbox: page.getByRole('button'),
      label: page.getByText('Some Value Label'),
      valueCount: page.getByText('42'),
      exclusionButton: page.getByLabelText(
        'Exclusion filter on Test Value; 42 results'
      ),
    };
  };

  it('renders all elements', async () => {
    const {listItem, label, valueCount, checkbox} = await setupElement();
    expect(listItem).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(valueCount).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
  });

  it('renders correctly with valid parts', async () => {
    const {label, valueCount, checkbox} = await setupElement();

    expect(label).toHaveAttribute('part', 'value-checkbox-label');
    expect(valueCount).toHaveAttribute('part', 'value-count');
    expect(checkbox).toHaveAttribute('part', 'value-checkbox');
  });

  it('calls onClick when checkbox is toggled', async () => {
    const onClick = vi.fn();

    const {checkbox} = await setupElement({onClick});

    checkbox.element().dispatchEvent(new MouseEvent('click'));

    expect(onClick).toHaveBeenCalled();
  });

  it('calls createRipple when checkbox is toggled', async () => {
    const createRippleSpy = vi.mocked(createRipple);

    const {checkbox} = await setupElement();

    checkbox.element().dispatchEvent(new MouseEvent('mousedown'));

    expect(createRippleSpy).toHaveBeenCalled();
  });

  describe('when is a tri-state checkbox', () => {
    it('calls #renderTriStateCheckbox with the correct attributes', async () => {
      const renderTriStateCheckboxSpy = vi.mocked(renderTriStateCheckbox);
      const buttonRef = vi.fn();
      await setupElement({
        state: 'idle',
        isSelected: false,
        buttonRef,
      });

      expect(renderTriStateCheckboxSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          ariaLabel: 'Inclusion filter on Test Value; 42 results',
          class: 'value-checkbox',
          iconPart: 'value-checkbox-icon',
          part: 'value-checkbox',
          id: expect.stringMatching(/^facet-value-/),
          ref: buttonRef,
          state: 'idle',
        }),
      });
    });

    it('calls renderFacetValueExclude', async () => {
      const renderFacetValueExcludeSpy = vi.mocked(renderFacetValueExclude);
      await setupElement({
        state: 'idle',
        isSelected: false,
      });

      expect(renderFacetValueExcludeSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          ariaLabel: 'Exclusion filter on Test Value; 42 results',
          onClick: expect.any(Function),
        }),
      });
    });

    it('render tri-state checkbox with correct parts', async () => {
      const {triStateCheckbox} = await setupElement({
        state: 'idle',
        isSelected: false,
      });
      expect(triStateCheckbox).toBeInTheDocument();
      expect(triStateCheckbox).toHaveAttribute('part', 'value-checkbox');
    });

    it('should not render the exclusion button inside the aria-hidden label', async () => {
      const {label, exclusionButton} = await setupElement({
        state: 'idle',
        isSelected: false,
      });
      const nullExclusionButton = label
        .element()
        .querySelector('.value-exclude-button');
      expect(nullExclusionButton).not.toBeInTheDocument();
      expect(exclusionButton).toBeInTheDocument();
    });
  });

  describe('when is a regular checkbox', () => {
    it('calls #renderCheckbox with the correct attributes', async () => {
      const onClick = vi.fn();
      const renderCheckboxSpy = vi.mocked(renderCheckbox);
      const buttonRef = createRef();
      await setupElement({
        isSelected: false,
        onClick,
        buttonRef,
      });

      expect(renderCheckboxSpy).toHaveBeenCalledWith({
        props: expect.objectContaining({
          ariaLabel: 'Inclusion filter on Test Value; 42 results',
          checked: false,
          class: 'value-checkbox',
          iconPart: 'value-checkbox-icon',
          part: 'value-checkbox',
          id: expect.stringMatching(/^facet-value-/),
          ref: buttonRef,
        }),
      });
    });
  });
});
