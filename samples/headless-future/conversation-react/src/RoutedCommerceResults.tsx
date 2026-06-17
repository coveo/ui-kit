import {useState, useEffect, useRef} from 'react';
import {
  buildProductListController,
  buildPaginationController,
  type ProductListControllerState,
  type PaginationControllerState,
  type PaginationController,
} from '@coveo/headless-future';

interface RoutedCommerceResultsProps {
  interface: unknown;
}

export function RoutedCommerceResults(props: RoutedCommerceResultsProps) {
  const [state, setState] = useState<ProductListControllerState>({
    products: [],
  });

  const [paginationState, setPaginationState] =
    useState<PaginationControllerState>({
      page: 0,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    });

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
    };
  }, [props.interface]);

  return (
    <div>
      <h3>Commerce Results ({state.products.length})</h3>
      {state.products.length === 0 && <p>No products found.</p>}
      <ul style={{listStyle: 'none', padding: 0}}>
        {state.products.map((product) => (
          <li
            key={product.permanentid}
            style={{padding: '8px', borderBottom: '1px solid #eee'}}
          >
            <strong>{product.ec_name}</strong>
            {product.ec_price !== undefined && (
              <span style={{marginLeft: '8px'}}>
                ${product.ec_price.toFixed(2)}
              </span>
            )}
            {product.ec_brand && (
              <span style={{marginLeft: '8px', color: '#666'}}>
                {product.ec_brand}
              </span>
            )}
          </li>
        ))}
      </ul>
      {paginationState.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <button
            disabled={paginationState.page === 0}
            onClick={() =>
              paginationRef.current?.selectPage(paginationState.page - 1)
            }
          >
            ← Previous
          </button>
          <span>
            Page {paginationState.page + 1} of {paginationState.totalPages}
          </span>
          <button
            disabled={paginationState.page >= paginationState.totalPages - 1}
            onClick={() =>
              paginationRef.current?.selectPage(paginationState.page + 1)
            }
          >
            Next →
          </button>
          <select
            value={paginationState.pageSize}
            onChange={(e) =>
              paginationRef.current?.setPageSize(Number(e.target.value))
            }
            style={{marginLeft: 'auto'}}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}
    </div>
  );
}
