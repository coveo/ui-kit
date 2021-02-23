import {Component} from 'react';
import {
  buildCartRecommendationsList,
  CartRecommendationsList as HeadlessCartRecommendationsList,
  CartRecommendationsListState,
  Unsubscribe,
} from '@coveo/headless';
import {productRecommendationEngine} from '../../engine';

export interface CartRecommendationsListProps {
  skus: string[];
  maxNumberOfRecommendations?: number;
}

export class CartRecommendationsList extends Component<
  CartRecommendationsListProps
> {
  private controller: HeadlessCartRecommendationsList;
  public state: CartRecommendationsListState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: CartRecommendationsListProps) {
    super(props);

    this.controller = buildCartRecommendationsList(
      productRecommendationEngine,
      {
        options: {
          skus: this.props.skus,
          maxNumberOfRecommendations: this.props.maxNumberOfRecommendations,
        },
      }
    );
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <div>Oops {this.state.error.message}</div>
          <code>{JSON.stringify(this.state.error)}</code>
          <button onClick={() => this.controller.refresh()}>Try again</button>
        </div>
      );
    }

    if (!this.state.recommendations.length) {
      return <button onClick={() => this.controller.refresh()}>Refresh</button>;
    }

    return (
      <div>
        <button onClick={() => this.controller.refresh()}>Refresh</button>
        Based on your cart, you may like the following:
        <ul style={{textAlign: 'left'}}>
          {this.state.recommendations.map((product) => (
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
  }
}
