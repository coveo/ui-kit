import {useState, useEffect, useRef} from 'react';
import {
  buildResultListController,
  buildPaginationController,
  loadSearchParametersActions,
  type ResultListControllerState,
  type PaginationControllerState,
  type PaginationController,
} from '@coveo/headless-future';

interface RoutedSearchResultsProps {
  interface: unknown;
}

export function RoutedSearchResults(props: RoutedSearchResultsProps) {
  const [state, setState] = useState<ResultListControllerState | null>(null);
  const [paginationState, setPaginationState] =
    useState<PaginationControllerState | null>(null);
  const paginationRef = useRef<PaginationController | null>(null);

  useEffect(() => {
    const controller = buildResultListController({
      interface: props.interface as Parameters<
        typeof buildResultListController
      >[0]['interface'],
    });

    const paginationCtrl = buildPaginationController({
      interface: props.interface as Parameters<
        typeof buildPaginationController
      >[0]['interface'],
    });

    const searchParams = loadSearchParametersActions({
      interface: props.interface as Parameters<
        typeof loadSearchParametersActions
      >[0]['interface'],
    });

    // Temporary hack: all information should be retrieved from the activity
    searchParams.setPipeline('');
    searchParams.setConstantQuery('@source==("Sports - Blog")');

    paginationRef.current = paginationCtrl;

    setState({...controller.state});
    setPaginationState({...paginationCtrl.state});

    const unsubscribeResults = controller.subscribe(() => {
      setState({...controller.state});
    });

    const unsubscribePagination = paginationCtrl.subscribe(() => {
      setPaginationState({...paginationCtrl.state});
    });

    return () => {
      unsubscribeResults();
      unsubscribePagination();
    };
  }, [props.interface]);

  if (!state || !paginationState) {
    return null;
  }

  return (
    <div
      style={{
        padding: '12px',
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: '4px',
      }}
    >
      <h3 style={{margin: '0 0 12px', fontSize: '16px'}}>
        Showing {state.results.length} of {paginationState.totalCount} results
      </h3>
      {state.results.length === 0 && (
        <p style={{color: '#888', fontSize: '14px'}}>No results found.</p>
      )}
      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
        {state.results.map((result) => (
          <li
            key={result.uniqueId}
            style={{
              padding: '10px',
              marginBottom: '8px',
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
            }}
          >
            <div style={{fontWeight: 600, marginBottom: '4px'}}>
              {result.title}
            </div>
            {result.excerpt && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#444',
                  margin: '4px 0',
                  lineHeight: 1.4,
                }}
              >
                {result.excerpt}
              </p>
            )}
            <a
              href={result.clickUri}
              target="_blank"
              rel="noopener noreferrer"
              style={{fontSize: '11px', color: '#1890ff', marginTop: '4px'}}
            >
              {result.clickUri}
            </a>
          </li>
        ))}
      </ul>
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
    </div>
  );
}
