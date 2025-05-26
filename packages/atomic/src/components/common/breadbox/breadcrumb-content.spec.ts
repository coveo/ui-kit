import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {expect, describe, beforeAll, it} from 'vitest';
import {renderBreadcrumbContent} from './breadcrumb-content';

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
    const {value} = await renderComponent();
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
    });

    it('should have "excluded" class on the value', async () => {
      const {value} = await renderExclusionState();
      expect(value).toHaveClass('excluded');
    });
  });

  describe('when the breadcrumb is not in an exclusion state', () => {
    it('should have the correct classes on the label', async () => {
      const {label} = await renderSelectedState();
      expect(label).not.toHaveClass('excluded');
    });

    it('should not have "excluded" class on the value', async () => {
      const {value} = await renderSelectedState();
      expect(value).not.toHaveClass('excluded');
    });
  });

  describe('when the breadcrumb is in an idle state', () => {
    it('should have the "idle" class on the label', async () => {
      const {label} = await renderIdleState();
      expect(label).toHaveClass('idle');
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
    });

    it('should have the "selected" class on the value', async () => {
      const {value} = await renderSelectedState();
      expect(value).toHaveClass('selected');
    });
  });
});
