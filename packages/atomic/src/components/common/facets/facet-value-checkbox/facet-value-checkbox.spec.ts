import {createRipple} from '@/src/utils/ripple';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html, TemplateResult} from 'lit';
import {createRef} from 'lit/directives/ref.js';
import {expect, vi, describe, beforeAll, it} from 'vitest';
import {renderCheckbox} from '../../checkbox';
import {renderTriStateCheckbox} from '../../triStateCheckbox';
import {FacetValueProps} from '../facet-common';
import {renderFacetValueExclude} from '../facet-value-exclude/facet-value-exclude';
import {
  renderFacetValueCheckbox,
  TriStateFacetValueProps,
} from './facet-value-checkbox';

vi.mock('../../triStateCheckbox', {spy: true});
vi.mock('../../checkbox', {spy: true});
vi.mock('../facet-value-exclude/facet-value-exclude', {spy: true});
vi.mock('@/src/utils/ripple', {spy: true});

describe('renderFacetValueCheckbox', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (
    props?: Partial<FacetValueProps | TriStateFacetValueProps>
  ) => {
    const children: TemplateResult = html`Some Value Label`;
    const baseProps: FacetValueProps = {
      displayValue: 'Test Value',
      numberOfResults: 42,
      isSelected: false,
      i18n,
      onClick: vi.fn(),
      buttonRef: vi.fn(),
    };

    return await renderFunctionFixture(
      html`${renderFacetValueCheckbox({
        props: {...baseProps, ...props},
      })(children)}`
    );
  };

  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get checkbox() {
      return page.getByRole('checkbox');
    },
    get triStateCheckbox() {
      return page.getByRole('button');
    },
    get label() {
      return page.getByText('Some Value Label');
    },
    get valueCount() {
      return page.getByText('42');
    },
  };

  it('renders all elements', async () => {
    await setupElement();

    const {listItem, label, valueCount, checkbox} = locators;
    await expect(listItem).toBeInTheDocument();
    await expect(label).toBeInTheDocument();
    await expect(valueCount).toBeInTheDocument();
    await expect(checkbox).toBeInTheDocument();
  });

  it('renders correctly with valid parts', async () => {
    await setupElement();

    const {label, valueCount, checkbox} = locators;

    await expect(label).toHaveAttribute('part', 'value-checkbox-label');
    await expect(valueCount).toHaveAttribute('part', 'value-count');
    await expect(checkbox).toHaveAttribute('part', 'value-checkbox');
  });

  it('calls onClick when checkbox is toggled', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {checkbox} = locators;

    checkbox.element().dispatchEvent(new MouseEvent('click'));

    expect(onClick).toHaveBeenCalled();
  });

  it('calls createRipple when checkbox is toggled', async () => {
    const createRippleSpy = vi.mocked(createRipple);
    await setupElement();
    const {checkbox} = locators;

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
          ariaLabel:
            'Inclusion filter on Test Value; {{formattedCount}} results',
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
          ariaLabel:
            'Exclusion filter on Test Value; {{formattedCount}} results',
          onClick: expect.any(Function),
        }),
      });
    });

    it('render tri-state checkbox with correct parts', async () => {
      await setupElement({
        state: 'idle',
        isSelected: false,
      });

      const {triStateCheckbox} = locators;
      await expect(triStateCheckbox).toBeInTheDocument();
      await expect(triStateCheckbox).toHaveAttribute('part', 'value-checkbox');
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
          ariaLabel:
            'Inclusion filter on Test Value; {{formattedCount}} results',
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
