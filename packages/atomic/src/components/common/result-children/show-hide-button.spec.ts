import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderShowHideButton} from './show-hide-button';

describe('#renderShowHideButton', () => {
  let loadFullCollectionSpy: MockInstance;
  let toggleShowInitialChildrenSpy: MockInstance;

  beforeEach(() => {
    loadFullCollectionSpy = vi.fn();
    toggleShowInitialChildrenSpy = vi.fn();
  });

  const renderComponent = async (props = {}) => {
    const defaultProps = {
      moreResultsAvailable: false,
      loadFullCollection: loadFullCollectionSpy,
      showInitialChildren: false,
      toggleShowInitialChildren: toggleShowInitialChildrenSpy,
      loadAllResults: 'Load all results',
      collapseResults: 'Collapse results',
    };

    const element = await renderFunctionFixture(
      html`${renderShowHideButton({props: {...defaultProps, ...props}})}`
    );

    return {
      button: page.getByRole('button'),
      element,
    };
  };

  it('should render a button with part "show-hide-button"', async () => {
    const {element} = await renderComponent();
    const button = element.querySelector('button[part="show-hide-button"]');

    expect(button).toBeTruthy();
  });

  it('should render a button with class "show-hide-button"', async () => {
    const {element} = await renderComponent();
    const button = element.querySelector('button.show-hide-button');

    expect(button).toBeTruthy();
  });

  describe('when moreResultsAvailable is true and showInitialChildren is false', () => {
    it('should display loadAllResults text', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: true,
        showInitialChildren: false,
      });

      await expect.element(button).toHaveTextContent('Load all results');
    });

    it('should call loadFullCollection and toggleShowInitialChildren when clicked', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: true,
        showInitialChildren: false,
      });

      await button.click();

      expect(loadFullCollectionSpy).toHaveBeenCalled();
      expect(toggleShowInitialChildrenSpy).toHaveBeenCalled();
    });
  });

  describe('when showInitialChildren is true and moreResultsAvailable is false', () => {
    it('should display loadAllResults text', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: false,
        showInitialChildren: true,
      });

      await expect.element(button).toHaveTextContent('Load all results');
    });

    it('should only call toggleShowInitialChildren when clicked', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: false,
        showInitialChildren: true,
      });

      await button.click();

      expect(loadFullCollectionSpy).not.toHaveBeenCalled();
      expect(toggleShowInitialChildrenSpy).toHaveBeenCalled();
    });
  });

  describe('when showInitialChildren is false and moreResultsAvailable is false', () => {
    it('should display collapseResults text', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: false,
        showInitialChildren: false,
      });

      await expect.element(button).toHaveTextContent('Collapse results');
    });

    it('should only call toggleShowInitialChildren when clicked', async () => {
      const {button} = await renderComponent({
        moreResultsAvailable: false,
        showInitialChildren: false,
      });

      await button.click();

      expect(loadFullCollectionSpy).not.toHaveBeenCalled();
      expect(toggleShowInitialChildrenSpy).toHaveBeenCalled();
    });
  });
});
