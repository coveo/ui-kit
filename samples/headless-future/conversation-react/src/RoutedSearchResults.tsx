import {useState, useEffect} from 'react';
import {
  buildResultListController,
  type ResultListControllerState,
} from '@coveo/headless-future';

interface RoutedSearchResultsProps {
  interface: unknown;
}

export function RoutedSearchResults(props: RoutedSearchResultsProps) {
  const [state, setState] = useState<ResultListControllerState>({results: []});

  useEffect(() => {
    const controller = buildResultListController({
      interface: props.interface as Parameters<
        typeof buildResultListController
      >[0]['interface'],
    });

    setState({...controller.state});

    const unsubscribe = controller.subscribe(() => {
      setState({...controller.state});
    });

    return unsubscribe;
  }, [props.interface]);

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
        Search Results ({state.results.length})
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
            <div style={{fontSize: '11px', color: '#999', marginTop: '4px'}}>
              {result.uri}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
