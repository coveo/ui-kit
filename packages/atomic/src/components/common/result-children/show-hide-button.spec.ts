import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  renderShowHideButton,
  type ShowHideButtonProps,
} from './show-hide-button';

describe('#renderShowHideButton', () => {
  const defaultProps: ShowHideButtonProps = {
    moreResultsAvailable: false,
    loadFullCollection: vi.fn(),
    showInitialChildren: true,
    toggleShowInitialChildren: vi.fn(),
    loadAllResults: 'Load all results',
    collapseResults: 'Collapse results',
  };

  const renderComponent = async (props: Partial<ShowHideButtonProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderShowHideButton({props: {...defaultProps, ...props}})}`
    );
  };

  const locators = {
    get button() {
      return page.getByRole('button');
    },
  };

  it('should render a button', async () => {
    await renderComponent();
    await expect.element(locators.button).toBeInTheDocument();
  });

  it('should apply the correct part attribute', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button');
    expect(button).toHaveAttribute('part', 'show-hide-button');
  });

  it('should apply the correct class', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button');
    expect(button).toHaveClass('show-hide-button');
  });

  describe('when showInitialChildren is true', () => {
    it('should display loadAllResults text', async () => {
      await renderComponent({
        showInitialChildren: true,
        moreResultsAvailable: false,
      });
      await expect
        .element(locators.button)
        .toHaveTextContent('Load all results');
    });
  });

  describe('when showInitialChildren is false and moreResultsAvailable is false', () => {
    it('should display collapseResults text', async () => {
      await renderComponent({
        showInitialChildren: false,
        moreResultsAvailable: false,
      });
      await expect
        .element(locators.button)
        .toHaveTextContent('Collapse results');
    });
  });

  describe('when moreResultsAvailable is true', () => {
    it('should display loadAllResults text', async () => {
      await renderComponent({
        showInitialChildren: false,
        moreResultsAvailable: true,
      });
      await expect
        .element(locators.button)
        .toHaveTextContent('Load all results');
    });
  });

  describe('when button is clicked', () => {
    describe('when moreResultsAvailable is true', () => {
      it('should call loadFullCollection and toggleShowInitialChildren twice', async () => {
        const loadFullCollection = vi.fn();
        const toggleShowInitialChildren = vi.fn();

        await renderComponent({
          moreResultsAvailable: true,
          loadFullCollection,
          toggleShowInitialChildren,
        });

        await locators.button.click();

        expect(loadFullCollection).toHaveBeenCalledOnce();
        expect(toggleShowInitialChildren).toHaveBeenCalledTimes(2);
      });
    });

    describe('when moreResultsAvailable is false', () => {
      it('should call toggleShowInitialChildren once', async () => {
        const loadFullCollection = vi.fn();
        const toggleShowInitialChildren = vi.fn();

        await renderComponent({
          moreResultsAvailable: false,
          loadFullCollection,
          toggleShowInitialChildren,
        });

        await locators.button.click();

        expect(loadFullCollection).not.toHaveBeenCalled();
        expect(toggleShowInitialChildren).toHaveBeenCalledOnce();
      });
    });
  });

  describe('button text variations', () => {
    it('should render custom loadAllResults text', async () => {
      await renderComponent({
        showInitialChildren: true,
        loadAllResults: 'Custom load text',
      });
      await expect
        .element(locators.button)
        .toHaveTextContent('Custom load text');
    });

    it('should render custom collapseResults text', async () => {
      await renderComponent({
        showInitialChildren: false,
        moreResultsAvailable: false,
        collapseResults: 'Custom collapse text',
      });
      await expect
        .element(locators.button)
        .toHaveTextContent('Custom collapse text');
    });
  });
});
