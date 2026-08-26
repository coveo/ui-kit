import type {RoutedInterface} from '@coveo/thermidor';
import {ProductTargeting} from '../ProductTargeting/ProductTargeting.js';
import {type TargetedProduct} from '../../context/targeting.js';
import {DecomposedCommerceLayout} from '../DecomposedCommerceLayout/DecomposedCommerceLayout.js';
import styles from './SearchResultsPage.module.css';

interface SearchResultsPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  routedInterface: RoutedInterface;
  query?: string;
  onBackToConversation: () => void;
  products: TargetedProduct[];
  onProductsChange: (products: TargetedProduct[]) => void;
}

/**
 * Layout shell for a routed search surface.
 *
 * Commerce search surfaces are decomposed into individual A2-UI components
 * (search-box, product-list, pagination, sort) rendered through the catalog
 * pipeline. This page only arranges them spatially via `DecomposedCommerceLayout`
 * and does not instantiate headless controllers.
 */
export function SearchResultsPage(props: SearchResultsPageProps) {
  const {routedInterface} = props;
  if (!routedInterface || routedInterface.useCase !== 'decomposedCommerce') {
    return null;
  }

  return (
    <div className={styles.searchLayout}>
      <ProductTargeting
        products={props.products}
        onProductsChange={props.onProductsChange}
        onSubmit={props.onSubmit}
        isStreaming={props.isStreaming}
        promptProps={{
          initialValue: props.query ?? '',
        }}
      >
        <DecomposedCommerceLayout
          surfaceId={routedInterface.surfaceId}
          surfaceType={routedInterface.surfaceType}
        />
      </ProductTargeting>
      <button
        type="button"
        className={styles.floatingBackButton}
        onClick={props.onBackToConversation}
        title="Back to conversation"
        aria-label="Back to conversation"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
