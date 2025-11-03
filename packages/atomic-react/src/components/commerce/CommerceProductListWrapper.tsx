import type {AtomicCommerceProductList} from '@coveo/atomic/components';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@coveo/atomic/loader';
import type {Product} from '@coveo/headless/commerce';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicProductLink,
  AtomicCommerceProductList as LitAtomicCommerceProductList,
} from './components.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

interface AtomicCommerceProductListProps {
  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  density?: ItemDisplayDensity;
  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  display?: ItemDisplayLayout;
  /**
   * The expected size of the image displayed for products.
   */
  imageSize?: ItemDisplayImageSize;
  /**
   * The desired number of placeholders to display while the product list is loading.
   */
  numberOfPlaceholders?: number;
}

interface HTMLAtomicCommerceProductListElement
  extends AtomicCommerceProductList,
    HTMLElement {}

// biome-ignore lint/correctness/noUnusedVariables: <>
var HTMLAtomicCommerceProductListElement: {
  prototype: HTMLAtomicCommerceProductListElement;
  new (): HTMLAtomicCommerceProductListElement;
};

/**
 * The properties of the AtomicCommerceProductList component
 */
interface WrapperProps extends AtomicCommerceProductListProps {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Product) => JSX.Element | Template;
}
/**
 * This component serves as a wrapper for the core AtomicCommerceProductList.
 *
 * @param props
 * @returns
 */
export const ListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const commerceProductListRef =
    useRef<HTMLAtomicCommerceProductListElement>(null);
  useEffect(() => {
    commerceProductListRef.current?.setRenderFunction(
      (product, root, linkContainer) => {
        const templateResult = template(product as Product);
        if (hasLinkTemplate(templateResult)) {
          createRoot(linkContainer!).render(templateResult.linkTemplate);
          createRoot(root).render(templateResult.contentTemplate);
          return renderToString(templateResult.contentTemplate);
        }
        if (linkContainer !== undefined) {
          createRoot(root).render(templateResult);
          otherProps.display === 'grid'
            ? createRoot(linkContainer).render(
                <AtomicProductLink></AtomicProductLink>
              )
            : // biome-ignore lint/complexity/noUselessFragments: <>
              createRoot(linkContainer).render(<></>);
        }
        return renderToString(templateResult);
      }
    );
  }, [otherProps.display, template]);
  return (
    <LitAtomicCommerceProductList
      ref={commerceProductListRef}
      {...otherProps}
    />
  );
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
