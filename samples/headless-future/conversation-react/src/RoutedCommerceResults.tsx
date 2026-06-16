import {useState, useEffect} from 'react';
import {
  buildProductListController,
  type ProductListControllerState,
} from '@coveo/headless-future';

interface RoutedCommerceResultsProps {
  interface: unknown;
}

export function RoutedCommerceResults(props: RoutedCommerceResultsProps) {
  const [state, setState] = useState<ProductListControllerState>({
    products: [],
  });

  useEffect(() => {
    const controller = buildProductListController({
      interface: props.interface as Parameters<
        typeof buildProductListController
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
        background: '#f0f5ff',
        border: '1px solid #adc6ff',
        borderRadius: '4px',
      }}
    >
      <h3 style={{margin: '0 0 12px', fontSize: '16px'}}>
        Commerce Results ({state.products.length})
      </h3>
      {state.products.length === 0 && (
        <p style={{color: '#888', fontSize: '14px'}}>No products found.</p>
      )}
      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
        {state.products.map((product) => (
          <li
            key={product.permanentid}
            style={{
              padding: '10px',
              marginBottom: '8px',
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
            }}
          >
            <div style={{fontWeight: 600, marginBottom: '4px'}}>
              {product.ec_name}
            </div>
            {product.ec_price !== undefined && (
              <div style={{fontSize: '13px', color: '#389e0d'}}>
                {'$' + product.ec_price.toFixed(2)}
              </div>
            )}
            {product.ec_brand && (
              <div style={{fontSize: '12px', color: '#666'}}>
                {product.ec_brand}
              </div>
            )}
            {product.clickUri && (
              <div style={{fontSize: '11px', color: '#999', marginTop: '4px'}}>
                {product.clickUri}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
