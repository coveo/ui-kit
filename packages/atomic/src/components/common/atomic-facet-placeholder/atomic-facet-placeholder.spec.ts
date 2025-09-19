import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-facet-placeholder';
import type {AtomicFacetPlaceholder} from './atomic-facet-placeholder';

describe('atomic-facet-placeholder', () => {
  const createElement = async (props?: Partial<AtomicFacetPlaceholder>) => {
    const element = await fixture(
      html`<atomic-facet-placeholder
        value-count="${ifDefined(props?.valueCount)}"
      ></atomic-facet-placeholder>`
    );

    return {
      element,
      get valueSkeletons() {
        return element.shadowRoot?.querySelectorAll('[part="value-skeleton"]');
      },
      get titleSkeleton() {
        return element.shadowRoot?.querySelector('[part="title-skeleton"]');
      },
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
    };
  };

  it('should render', async () => {
    const {element} = await createElement();
    await expect.element(element).toBeInTheDocument();
  });

  it('should have default value count of 8', async () => {
    const {valueSkeletons} = await createElement();
    expect(valueSkeletons?.length).toBe(8);
  });

  it('should use the defined value count', async () => {
    const {valueSkeletons} = await createElement({valueCount: 2});
    expect(valueSkeletons?.length).toBe(2);
  });

  it('should render the correct number of value part skeletons', async () => {
    const {valueSkeletons} = await createElement();
    expect(valueSkeletons?.length).toBe(8);
  });

  it('should render the title skeleton', async () => {
    const {titleSkeleton} = await createElement();
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('should have aria-hidden attribute on placeholder', async () => {
    const {placeholder} = await createElement();
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });
});
