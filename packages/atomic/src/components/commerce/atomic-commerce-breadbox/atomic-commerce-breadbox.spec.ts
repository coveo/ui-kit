import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/breadcrumb-manager-subcontroller';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {
  BreadcrumbManager,
  BreadcrumbManagerState,
  buildContext,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, it, expect, vi} from 'vitest';
import './atomic-commerce-breadbox';
import {AtomicCommerceBreadbox} from './atomic-commerce-breadbox';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceBreadbox', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;

  interface RenderBreadboxOptions {
    interfaceElementType?: 'product-listing' | 'search';
    pathLimit?: number;
    state?: Partial<BreadcrumbManagerState>;
  }

  const renderBreadbox = async ({
    interfaceElementType = 'product-listing',
    pathLimit = 3,
    state = {},
  }: RenderBreadboxOptions = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({state});
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );
    vi.mocked(buildContext).mockReturnValue(buildFakeContext({}));

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceBreadbox>({
        template: html`<div>
          <atomic-commerce-breadbox
            path-limit=${ifDefined(pathLimit)}
          ></atomic-commerce-breadbox>
        </div>`,
        selector: 'atomic-commerce-breadbox',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceElementType;
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return element;
  };

  it('should call buildProductListing when interfaceElement.type is "product-listing"', async () => {
    await renderBreadbox({interfaceElementType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildSearch when interfaceElement.type is "search"', async () => {
    await renderBreadbox({interfaceElementType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildContext', async () => {
    await renderBreadbox();
    expect(buildContext).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call breadcrumbManager on this.breadcrumbManager', async () => {
    const element = await renderBreadbox();
    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should start the ResizeObserver', async () => {
    const mockedObserver = vi.fn();
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockedObserver,
    }));

    await renderBreadbox();

    expect(ResizeObserver).toHaveBeenCalled();
    expect(mockedObserver).toHaveBeenCalled();
  });

  it('should throw when pathLimit is lower than 1', async () => {
    await expect(() =>
      renderBreadbox({interfaceElementType: 'product-listing', pathLimit: 0})
    ).rejects.toThrowError(/pathLimit: minimum value of 1 not respected/i);
  });

  it('should throw when pathLimit is valid but gets changed to lower than 1', async () => {
    const element = await renderBreadbox({
      interfaceElementType: 'product-listing',
      pathLimit: 3,
    });

    element.pathLimit = 0;
    await expect(element.updateComplete).rejects.toThrowError(
      /pathLimit: minimum value of 1 not respected/i
    );
  });

  it('should render nothing when there are no breadcrumbs', async () => {
    const element = await renderBreadbox({
      state: {facetBreadcrumbs: []},
    });

    expect(
      element.shadowRoot?.querySelector('atomic-commerce-breadbox')
    ).toBeNull();
  });
});
