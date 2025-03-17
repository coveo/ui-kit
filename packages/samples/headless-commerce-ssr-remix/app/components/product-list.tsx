import {useProductList} from '@/lib/commerce-engine';
import {formatCurrency} from '@/utils/format-utils';
import {HighlightKeyword, Product} from '@coveo/headless-react/ssr-commerce';
import {useNavigate} from '@remix-run/react';

interface IProductListProps {
  currency: string;
  language: string;
}

export default function ProductList(props: IProductListProps) {
  const {currency, language} = props;
  const {state, methods} = useProductList();
  const navigate = useNavigate();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    navigate(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  const renderPrice = (product: Product) => {
    if (!product.ec_price) {
      return null;
    }

    const original_price = formatCurrency(product.ec_price, language, currency);
    const promo_price = product.ec_promo_price
      ? formatCurrency(product.ec_promo_price, language, currency)
      : original_price;

    if (original_price === promo_price) {
      return <span>{original_price}</span>;
    }

    return (
      <span>
        <span>{promo_price}</span>
        <span>
          {' '}
          <s>{original_price}</s>
        </span>
      </span>
    );
  };

  const renderSeparator = (index: number) => {
    if (index === state.products.length - 1) {
      return null;
    }

    return <hr />;
  };

  const highlightKeywords = (text: string, highlights: HighlightKeyword[]) => {
    let highlightedText = '';
    let currentIndex = 0;

    highlights.forEach((highlight) => {
      highlightedText += text.slice(currentIndex, highlight.offset);
      highlightedText += `<mark>${text.slice(
        highlight.offset,
        highlight.offset + highlight.length
      )}</mark>`;
      currentIndex = highlight.offset + highlight.length;
    });

    highlightedText += text.slice(currentIndex);

    return {__html: highlightedText};
  };

  const getHighlightedTitle = (product: Product) => {
    if (!product.ec_name) {
      return {__html: ''};
    }

    if (!product.nameHighlights) {
      return {__html: product.ec_name};
    }

    return highlightKeywords(product.ec_name, product.nameHighlights);
  };

  const getHighlightedExcerpt = (product: Product) => {
    if (!product.excerpt) {
      return {__html: ''};
    }

    if (!product.excerptHighlights) {
      return {__html: product.excerpt};
    }

    return highlightKeywords(product.excerpt, product.excerptHighlights);
  };

  return (
    <ul aria-label="Product List">
      {state.products.map((product, index) => (
        <li key={product.ec_product_id}>
          <button
            disabled={!methods}
            onClick={() => onProductClick(product)}
            dangerouslySetInnerHTML={getHighlightedTitle(product)}
          ></button>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{flex: 3}}>
              <img src={product.ec_images[0]} height="100px"></img>
            </div>
            <div style={{flex: 9}}>
              <p dangerouslySetInnerHTML={getHighlightedExcerpt(product)}></p>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            {renderPrice(product)}
          </div>

          {renderSeparator(index)}
        </li>
      ))}
    </ul>
  );
}
