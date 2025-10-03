import {describe, expect, it} from 'vitest';
import './atomic-layout-section';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicLayoutSection} from './atomic-layout-section';
import type {Section} from './atomic-layout-section-utils';

describe('atomic-layout-section', () => {
  let element: AtomicLayoutSection;

  interface LayoutSectionProps {
    section?: Section;
    minWidth?: string;
    maxWidth?: string;
  }

  const setupLayoutSection = async ({
    section = 'search',
    minWidth,
    maxWidth,
  }: LayoutSectionProps = {}) => {
    const element = await fixture<AtomicLayoutSection>(html`
      <atomic-layout-section section="${section}" min-width="${ifDefined(minWidth)}" max-width="${ifDefined(maxWidth)}">
        <h1>Hello World</h1>
      </atomic-layout-section>
    `);

    return element;
  };

  it('should render children in light DOM', async () => {
    element = await setupLayoutSection();

    expect(element.shadowRoot).toBeNull();
    expect(element.querySelector('h1')).not.toBeNull();
  });

  it('should reflect the section property', async () => {
    element = await setupLayoutSection({section: 'search'});
    expect(element).toHaveAttribute('section', 'search');
  });

  it('should reflect the minWidth property', async () => {
    element = await setupLayoutSection({minWidth: '300px'});
    expect(element).toHaveAttribute('min-width', '300px');
  });

  it('should reflect the maxWidth property', async () => {
    element = await setupLayoutSection({maxWidth: '600px'});
    expect(element).toHaveAttribute('max-width', '600px');
  });
});
