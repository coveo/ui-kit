import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbContent} from './breadcrumb-content';
import {getFirstBreadcrumbValue} from './breadcrumb-utils';

vi.mock('./breadcrumb-utils', {spy: true});

describe('#renderBreadcrumbContent', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbContent({
        props: {
          i18n,
          pathLimit: 0,
          isCollapsed: false,
          breadcrumb: {
            label: 'test',
            state: 'selected' as const,
            facetId: 'test-facet',
            formattedValue: ['test'],
            deselect: () => {},
          },
          ...overrides,
        },
      })}`
    );

    return {
      label: element.querySelector('span[part="breadcrumb-label"]'),
      value: element.querySelector('span[part="breadcrumb-value"]'),
      icon: element.querySelector('atomic-icon[part="breadcrumb-clear"]'),
    };
  };

  const renderExclusionState = async () =>
    renderComponent({
      breadcrumb: {
        label: 'test',
        state: 'excluded' as const,
        facetId: 'test-facet',
        formattedValue: ['test'],
        deselect: () => {},
      },
    });

  const renderIdleState = async () =>
    renderComponent({
      breadcrumb: {
        label: 'test',
        state: 'idle' as const,
        facetId: 'test-facet',
        formattedValue: ['test'],
        deselect: () => {},
      },
    });

  const renderSelectedState = async () =>
    renderComponent({
      breadcrumb: {
        label: 'test',
        state: 'selected' as const,
        facetId: 'test-facet',
        formattedValue: ['test'],
        deselect: () => {},
      },
    });

  const renderWithContent = async () =>
    renderComponent({
      breadcrumb: {
        label: 'test',
        state: 'selected' as const,
        facetId: 'test-facet',
        formattedValue: ['test'],
        content: 'fake content',
        deselect: () => {},
      },
    });

  it('should have the "breadcrumb-label" part on the label', async () => {
    const {label} = await renderComponent();
    expect(label).toHaveAttribute('part', 'breadcrumb-label');
  });

  it('should have the correct label text', async () => {
    const {label} = await renderComponent();
    expect(label).toHaveTextContent('test:');
  });

  it('should have the "breadcrumb-value" part on the value', async () => {
    const {value} = await renderComponent();
    expect(value).toHaveAttribute('part', 'breadcrumb-value');
  });

  it('should have the correct value text', async () => {
    vi.mocked(getFirstBreadcrumbValue).mockReturnValue('test');

    const {value} = await renderComponent();

    expect(getFirstBreadcrumbValue).toHaveBeenCalledWith(
      expect.objectContaining({
        formattedValue: ['test'],
      }),
      0
    );
    expect(value).toHaveTextContent('test');
  });

  it('should have the "breadcrumb-clear" part on the icon', async () => {
    const {icon} = await renderComponent();
    expect(icon).toHaveAttribute('part', 'breadcrumb-clear');
  });

  it('should have an svg icon', async () => {
    const {icon} = await renderComponent();
    expect(icon?.getAttribute('icon')).toContain('<svg');
  });

  describe('when the breadcrumb is in an exclusion state', () => {
    it('should have the correct classes on the label', async () => {
      const {label} = await renderExclusionState();
      expect(label).toHaveClass('excluded');
      expect(label).toHaveClass(
        'group-hover:text-error group-focus-visible:text-error'
      );
    });

    it('should have "excluded" class on the value', async () => {
      const {value} = await renderExclusionState();
      expect(value).toHaveClass('excluded');
    });
  });

  describe('when the breadcrumb is in an idle state', () => {
    it('should have the "idle" class on the label', async () => {
      const {label} = await renderIdleState();
      expect(label).toHaveClass('idle');
      expect(label).toHaveClass(
        'group-hover:text-primary group-focus-visible:text-primary'
      );
    });

    it('should have the "idle" class on the value', async () => {
      const {value} = await renderIdleState();
      expect(value).toHaveClass('idle');
    });
  });

  describe('when the breadcrumb is in a selected state', () => {
    it('should have the "selected" class on the label', async () => {
      const {label} = await renderSelectedState();
      expect(label).toHaveClass('selected');
      expect(label).toHaveClass(
        'group-hover:text-primary group-focus-visible:text-primary'
      );
    });

    it('should have the "selected" class on the value', async () => {
      const {value} = await renderSelectedState();
      expect(value).toHaveClass('selected');
    });
  });

  describe('when the breadcrumb has content', () => {
    it('should render the content instead of the value', async () => {
      const {value} = await renderWithContent();
      expect(value).toHaveTextContent('fake content');
    });

    it('should have the proper classes on the value', async () => {
      const {value} = await renderWithContent();
      expect(value).toHaveClass('ml-1');
      expect(value).not.toHaveClass('max-w-[30ch] truncate selected');
    });
  });

  describe('when the breadcrumb label contains special characters', () => {
    it('should render ampersands without escaping', async () => {
      const {label} = await renderComponent({
        breadcrumb: {
          label: 'Brand & Co.',
          state: 'selected' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      expect(label).toHaveTextContent('Brand & Co.:');
    });

    it('should render less-than and greater-than symbols without escaping', async () => {
      const {label} = await renderComponent({
        breadcrumb: {
          label: 'Size < 10',
          state: 'selected' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      expect(label).toHaveTextContent('Size < 10:');
    });

    it('should render quotes without escaping', async () => {
      const {label} = await renderComponent({
        breadcrumb: {
          label: 'Category "Premium"',
          state: 'selected' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      expect(label).toHaveTextContent('Category "Premium":');
    });

    it('should render apostrophes without escaping', async () => {
      const {label} = await renderComponent({
        breadcrumb: {
          label: "Women's Brand",
          state: 'selected' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      expect(label).toHaveTextContent("Women's Brand:");
    });
  });
});
