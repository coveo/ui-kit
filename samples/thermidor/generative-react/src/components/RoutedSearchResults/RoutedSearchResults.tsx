import {useState, useEffect, useRef} from 'react';
import {
  buildResultListController,
  buildPaginationController,
  loadSearchParametersActions,
  type SearchInterface,
  type ResultListControllerState,
  type PaginationControllerState,
  type PaginationController,
} from '@coveo/thermidor';
import {ArticleCard} from '../ArticleCard/ArticleCard.js';
import {Pagination} from '../Pagination/Pagination.js';
import styles from './RoutedSearchResults.module.css';

interface RoutedSearchResultsProps {
  interface: SearchInterface;
}

export function RoutedSearchResults(props: RoutedSearchResultsProps) {
  const [state, setState] = useState<ResultListControllerState | null>(null);
  const [paginationState, setPaginationState] = useState<PaginationControllerState | null>(null);
  const paginationRef = useRef<PaginationController | null>(null);

  useEffect(() => {
    const controller = buildResultListController({
      interface: props.interface,
    });

    const paginationCtrl = buildPaginationController({
      interface: props.interface,
    });

    const searchParams = loadSearchParametersActions({
      interface: props.interface,
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
      props.interface.dispose();
    };
  }, [props.interface]);

  if (!state || !paginationState) {
    return null;
  }

  return (
    <div className={styles.container}>
      {state.results.length === 0 ? (
        <p className={styles.empty}>No results found.</p>
      ) : (
        <ul className={styles.list}>
          {state.results.map((result) => (
            <li key={result.uniqueId} className={styles.listItem}>
              <ArticleCard result={result} />
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={paginationState.page}
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        onPrevious={() => paginationRef.current?.selectPage(paginationState.page - 1)}
        onNext={() => paginationRef.current?.selectPage(paginationState.page + 1)}
        onPageSizeChange={(size) => paginationRef.current?.setPageSize(size)}
      />
    </div>
  );
}
