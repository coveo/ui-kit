import {buildInstantResults} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeInstantResults} from '@/vitest-utils/testing-helpers/fixtures/headless/search/instant-results-controller';
import type {AtomicSearchBoxInstantResults} from './atomic-search-box-instant-results';
import './atomic-search-box-instant-results';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-search-box-instant-results', () => {
  beforeEach(() => {
    vi.mocked(buildInstantResults).mockReturnValue(buildFakeInstantResults());
  });

  const renderComponent = async () => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicSearchBoxInstantResults>({
        template: html`<atomic-search-box-instant-results></atomic-search-box-instant-results>`,
        selector: 'atomic-search-box-instant-results',
      });
    return element;
  };

  describe('when its parent is not an atomic-search-box', () => {
    let consoleErrorSpy: MockInstance;
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      element = await fixture<AtomicSearchBoxInstantResults>(
        html`<atomic-search-box-instant-results></atomic-search-box-instant-results>`
      );
    });

    it('should log an error in the console', async () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The "atomic-search-box-instant-results" component was not handled, as it is not a child of the following elements: atomic-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(
          page.getByText('atomic-search-box-instant-results component error')
        )
        .toBeInTheDocument();
    });
  });

  describe('when properly initialized', () => {
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      element = await renderComponent();
    });

    it('should render with default properties', async () => {
      expect(element).toBeDefined();
      expect(element.maxResultsPerQuery).toBe(4);
      expect(element.density).toBe('normal');
      expect(element.imageSize).toBe('icon');
    });

    describe('#setRenderFunction', () => {
      it('should set the itemRenderingFunction property', async () => {
        const mockRenderFunction = vi.fn();

        await element.setRenderFunction(mockRenderFunction);

        expect(
          (element as unknown as {itemRenderingFunction: unknown})
            .itemRenderingFunction
        ).toBe(mockRenderFunction);
      });
    });
  });

  describe('property changes', () => {
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      element = await renderComponent();
    });

    it('should handle maxResultsPerQuery property changes', async () => {
      element.maxResultsPerQuery = 8;
      await element.updateComplete;
      expect(element.maxResultsPerQuery).toBe(8);
    });

    it('should handle density property changes', async () => {
      element.density = 'compact';
      await element.updateComplete;
      expect(element.density).toBe('compact');
    });

    it('should handle imageSize property changes', async () => {
      element.imageSize = 'large';
      await element.updateComplete;
      expect(element.imageSize).toBe('large');
    });
  });
});
