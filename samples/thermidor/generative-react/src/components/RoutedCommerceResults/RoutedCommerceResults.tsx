import {useState, useEffect, useRef} from 'react';
import {
  buildProductListController,
  buildPaginationController,
  type ProductListControllerState,
  type PaginationControllerState,
  type PaginationController,
} from '@coveo/thermidor';
import {ProductCard} from '../ProductCard/ProductCard.js';
import {Pagination} from '../Pagination/Pagination.js';
import styles from './RoutedCommerceResults.module.css';

interface RoutedCommerceResultsProps {
  interface: unknown;
}

export function RoutedCommerceResults(props: RoutedCommerceResultsProps) {
  const [state, setState] = useState<ProductListControllerState | null>(null);
  const [paginationState, setPaginationState] =
    useState<PaginationControllerState | null>(null);
  const paginationRef = useRef<PaginationController | null>(null);

  useEffect(() => {
    const controller = buildProductListController({
      interface: props.interface as Parameters<
        typeof buildProductListController
      >[0]['interface'],
    });

    const paginationCtrl = buildPaginationController({
      interface: props.interface as Parameters<
        typeof buildPaginationController
      >[0]['interface'],
    });

    paginationRef.current = paginationCtrl;

    setState({...controller.state});
    setPaginationState({...paginationCtrl.state});

    const unsubscribeProducts = controller.subscribe(() => {
      setState({...controller.state});
    });

    const unsubscribePagination = paginationCtrl.subscribe(() => {
      setPaginationState({...paginationCtrl.state});
    });

    return () => {
      unsubscribeProducts();
      unsubscribePagination();
      (props.interface as {dispose?: () => void}).dispose?.();
    };
  }, [props.interface]);

  if (!state || !paginationState) {
    return null;
  }

  return (
    <div className={styles.container}>
      {state.products.length === 0 ? (
        <p className={styles.empty}>No products found.</p>
      ) : (
        <div className={styles.grid}>
          {state.products.map((product) => (
            <ProductCard key={product.permanentid} product={product} />
          ))}
        </div>
      )}
      <Pagination
        page={paginationState.page}
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        onPrevious={() =>
          paginationRef.current?.selectPage(paginationState.page - 1)
        }
        onNext={() =>
          paginationRef.current?.selectPage(paginationState.page + 1)
        }
        onPageSizeChange={(size) => paginationRef.current?.setPageSize(size)}
      />
    </div>
  );
}
