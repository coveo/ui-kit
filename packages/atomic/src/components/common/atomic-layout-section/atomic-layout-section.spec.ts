import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it} from 'vitest';
import {AtomicLayoutSection} from './atomic-layout-section';
import {Section} from './sections';

describe('atomic-layout-section', () => {
  const locators = {
    get layout() {
      return page.getByTestId('atomic-layout-section');
    },
  };
  const setupElement = async (props?: {
    section?: Section;
    minWidth?: string;
    maxWidth?: string;
    slotContent?: string;
  }) => {
    return fixture<AtomicLayoutSection>(
      html`<atomic-layout-section
        data-testid="atomic-layout-section"
        section="${props?.section ?? 'main'}"
        min-width="${ifDefined(props?.minWidth)}"
        max-width="${ifDefined(props?.maxWidth)}"
        >${props?.slotContent ?? ''}</atomic-layout-section
      >`
    );
  };

  it('should render the slot content', async () => {
    await setupElement({
      section: 'main',
      slotContent: '<div data-testid="child">Test Child</div>',
    });
    const child = page.getByText('Test Child');
    await expect.element(child).toBeInTheDocument();
  });

  describe('when setting properties', () => {
    it('should reflect the section property to the attribute', async () => {
      await setupElement({section: 'facets'});
      await expect
        .element(locators.layout)
        .toHaveAttribute('section', 'facets');
    });

    it('should reflect the minWidth property to attributes', async () => {
      await setupElement({
        minWidth: '200px',
      });
      await expect
        .element(locators.layout)
        .toHaveAttribute('min-width', '200px');
    });

    it('should reflect the maxWidth property to attributes', async () => {
      await setupElement({
        maxWidth: '400px',
      });

      await expect
        .element(locators.layout)
        .toHaveAttribute('max-width', '400px');
    });

    it('should has undefined minWidth and maxWidth by default', async () => {
      await setupElement({section: 'main'});
      await expect.element(locators.layout).not.toHaveAttribute('max-width');
      await expect.element(locators.layout).not.toHaveAttribute('min-width');
    });
  });
});
