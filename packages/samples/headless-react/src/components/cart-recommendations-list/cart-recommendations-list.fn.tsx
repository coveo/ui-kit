import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildCartRecommendationsList,
  CartRecommendationsList as HeadlessCartRecommendationsList,
} from '@coveo/headless';
import {productRecommendationEngine} from '../../engine';

interface CartRecommendationsListProps {
  controller: HeadlessCartRecommendationsList;
}

export const CartRecommendationsList: FunctionComponent<CartRecommendationsListProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (state.error) {
    return (
      <div>
        <div>Oops {state.error.message}</div>
        <code>{JSON.stringify(state.error)}</code>
        <button onClick={() => controller.refresh()}>Try again</button>
      </div>
    );
  }

  if (!state.recommendations.length) {
    return <button onClick={() => controller.refresh()}>Refresh</button>;
  }

  return (
    <div>
      <button onClick={() => controller.refresh()}>Refresh</button>
      Based on your cart, you may like the following:
      <ul style={{textAlign: 'left'}}>
        {state.recommendations.map((product) => (
          <li key={product.sku}>
            <article>
              <h2>
                <a href={product.link}>{product.name}</a>
              </h2>
              <img
                src={product.thumbnailUrl}
                alt={`Thumbnail of ${product.name}`}
                style={{opacity: product.inStock ? 1 : 0.5}}
              />
              {product.promoPrice !== product.price ? (
                <span>
                  <s>{product.price}</s> <strong>{product.promoPrice}</strong>
                </span>
              ) : (
                <strong>{product.price}</strong>
              )}
              <details>
                <summary>More details</summary>
                <table>
                  <tr>
                    <th>Rating</th>
                    <td>{product.rating}/10</td>
                  </tr>
                  <tr>
                    <th>Brand</th>
                    <td>{product.brand}</td>
                  </tr>
                  <tr>
                    <th>In stock</th>
                    <td>{product.inStock ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>Categories</th>
                    <td>
                      <ul>
                        {product.categories.map((category) => (
                          <li key={category}>{category}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th>Tags</th>
                    <td>
                      <ul>
                        {product.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th>Identifier</th>
                    <td>{product.sku}</td>
                  </tr>
                </table>
              </details>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

const itemsCurrentlyInCart = [
  {
    name: 'FakeBrand TV Expensive Edition',
    sku: 'tv-fakebrand-expensiveedition',
  },
  {
    name: 'FakeBrand TV Stand Very Generic Edition',
    sku: 'tvaccessories-fakebrand-2014',
  },
];

const controller = buildCartRecommendationsList(productRecommendationEngine, {
  options: {
    maxNumberOfRecommendations: 7,
    skus: itemsCurrentlyInCart.map((item) => item.sku),
  },
});

<CartRecommendationsList controller={controller} />;
