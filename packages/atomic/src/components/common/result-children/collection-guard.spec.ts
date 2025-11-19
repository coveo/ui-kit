import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderCollectionGuard} from './collection-guard';

describe('#renderCollectionGuard', () => {
  const defaultProps = {
    isLoadingMoreResults: false,
    moreResultsAvailable: true,
    numberOfChildren: 3,
    density: 'normal' as const,
    imageSize: 'large' as const,
    noResultText: 'No results available',
  };

  const renderComponent = async (
    propsOverrides = {},
    children = html`<div class="test-children">Test Content</div>`
  ) => {
    return await renderFunctionFixture(
      html`${renderCollectionGuard({
        props: {
          ...defaultProps,
          ...propsOverrides,
        },
      })(children)}`
    );
  };

  describe('when isLoadingMoreResults is true', () => {
    it('should render the children-root wrapper', async () => {
      const element = await renderComponent({isLoadingMoreResults: true});

      const childrenRoot = element.querySelector('[part="children-root"]');
      expect(childrenRoot).toBeInTheDocument();
    });

    it('should render placeholder elements', async () => {
      const element = await renderComponent({
        isLoadingMoreResults: true,
        numberOfChildren: 5,
      });

      const placeholders = element.querySelectorAll(
        'atomic-result-placeholder'
      );
      expect(placeholders).toHaveLength(5);
    });

    it('should apply the density prop to placeholder elements', async () => {
      const element = await renderComponent({
        isLoadingMoreResults: true,
        density: 'compact',
      });

      const placeholders = element.querySelectorAll(
        'atomic-result-placeholder'
      );
      placeholders.forEach((placeholder) => {
        expect(placeholder.density).toBe('compact');
      });
    });

    it('should apply the imageSize prop to placeholder elements', async () => {
      const element = await renderComponent({
        isLoadingMoreResults: true,
        imageSize: 'small',
      });

      const placeholders = element.querySelectorAll(
        'atomic-result-placeholder'
      );
      placeholders.forEach((placeholder) => {
        expect(placeholder.imageSize).toBe('small');
      });
    });

    describe('when numberOfChildren is greater than 0', () => {
      it('should render before-children slot', async () => {
        const element = await renderComponent({
          isLoadingMoreResults: true,
          numberOfChildren: 3,
        });

        const slots = element.querySelectorAll('slot[name="before-children"]');
        expect(slots).toHaveLength(1);
      });

      it('should render after-children slot', async () => {
        const element = await renderComponent({
          isLoadingMoreResults: true,
          numberOfChildren: 3,
        });

        const slots = element.querySelectorAll('slot[name="after-children"]');
        expect(slots).toHaveLength(1);
      });
    });

    describe('when numberOfChildren is 0', () => {
      it('should not render before-children slot', async () => {
        const element = await renderComponent({
          isLoadingMoreResults: true,
          numberOfChildren: 0,
        });

        const slots = element.querySelectorAll('slot[name="before-children"]');
        expect(slots).toHaveLength(0);
      });

      it('should not render after-children slot', async () => {
        const element = await renderComponent({
          isLoadingMoreResults: true,
          numberOfChildren: 0,
        });

        const slots = element.querySelectorAll('slot[name="after-children"]');
        expect(slots).toHaveLength(0);
      });
    });
  });

  describe('when moreResultsAvailable is false and numberOfChildren is 0', () => {
    it('should render no-result-root paragraph when noResultText has content', async () => {
      const element = await renderComponent({
        moreResultsAvailable: false,
        numberOfChildren: 0,
        noResultText: 'No results found',
      });

      const noResultRoot = element.querySelector('[part="no-result-root"]');
      expect(noResultRoot).toBeInTheDocument();
      expect(noResultRoot?.textContent?.trim()).toBe('No results found');
    });

    it('should apply the correct classes to no-result-root', async () => {
      const element = await renderComponent({
        moreResultsAvailable: false,
        numberOfChildren: 0,
        noResultText: 'No results',
      });

      const noResultRoot = element.querySelector('[part="no-result-root"]');
      expect(noResultRoot?.classList.contains('no-result-root')).toBe(true);
      expect(noResultRoot?.classList.contains('my-3')).toBe(true);
    });

    it('should not render anything when noResultText is empty', async () => {
      const element = await renderComponent({
        moreResultsAvailable: false,
        numberOfChildren: 0,
        noResultText: '',
      });

      const noResultRoot = element.querySelector('[part="no-result-root"]');
      expect(noResultRoot).not.toBeInTheDocument();
    });

    it('should not render anything when noResultText contains only whitespace', async () => {
      const element = await renderComponent({
        moreResultsAvailable: false,
        numberOfChildren: 0,
        noResultText: '   ',
      });

      const noResultRoot = element.querySelector('[part="no-result-root"]');
      expect(noResultRoot).not.toBeInTheDocument();
    });
  });

  describe('when numberOfChildren is 0 and other conditions do not match', () => {
    it('should not render anything', async () => {
      const element = await renderComponent({
        moreResultsAvailable: true,
        numberOfChildren: 0,
        isLoadingMoreResults: false,
      });

      expect(element.children.length).toBe(0);
    });
  });

  describe('when numberOfChildren is greater than 0 and other conditions do not match', () => {
    it('should render the provided children', async () => {
      const testChildren = html`<div class="custom-child">Custom Content</div>`;
      const element = await renderComponent(
        {
          moreResultsAvailable: true,
          numberOfChildren: 3,
          isLoadingMoreResults: false,
        },
        testChildren
      );

      const customChild = element.querySelector('.custom-child');
      expect(customChild).toBeInTheDocument();
      expect(customChild?.textContent?.trim()).toBe('Custom Content');
    });

    it('should not render children-root wrapper', async () => {
      const element = await renderComponent({
        moreResultsAvailable: true,
        numberOfChildren: 3,
        isLoadingMoreResults: false,
      });

      const childrenRoot = element.querySelector('[part="children-root"]');
      expect(childrenRoot).not.toBeInTheDocument();
    });

    it('should not render placeholders', async () => {
      const element = await renderComponent({
        moreResultsAvailable: true,
        numberOfChildren: 3,
        isLoadingMoreResults: false,
      });

      const placeholders = element.querySelectorAll(
        'atomic-result-placeholder'
      );
      expect(placeholders).toHaveLength(0);
    });

    it('should not render no-result-root', async () => {
      const element = await renderComponent({
        moreResultsAvailable: true,
        numberOfChildren: 3,
        isLoadingMoreResults: false,
      });

      const noResultRoot = element.querySelector('[part="no-result-root"]');
      expect(noResultRoot).not.toBeInTheDocument();
    });
  });
});
