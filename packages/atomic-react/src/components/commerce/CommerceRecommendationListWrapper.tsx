import type {AtomicCommerceRecommendationList} from '@coveo/atomic/components';
import type {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@coveo/atomic/loader';
import type {Product} from '@coveo/headless/commerce';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicProductLink,
  AtomicCommerceRecommendationList as LitAtomicCommerceRecommendationList,
} from './components.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

interface AtomicCommerceRecommendationListProps {
  /**
   * The spacing of various elements in the recommendation list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  density?: ItemDisplayDensity;
  /**
   * The desired layout to use when displaying recommendations. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  display?: ItemDisplayBasicLayout;
  /**
   * The expected size of the image displayed for recommendations.
   */
  imageSize?: ItemDisplayImageSize;
  /**
   * The desired number of placeholders to display while the recommendation list is loading.
   */
  numberOfPlaceholders?: number;

  slotId?: string;

  productsPerPage?: number;
}

interface HTMLAtomicCommerceRecommendationListElement
  extends AtomicCommerceRecommendationList,
    HTMLElement {}

// biome-ignore lint/correctness/noUnusedVariables: <>
var HTMLAtomicCommerceRecommendationListElement: {
  prototype: HTMLAtomicCommerceRecommendationListElement;
  new (): HTMLAtomicCommerceRecommendationListElement;
};

/**
 * The properties of the AtomicCommerceRecommendationList component
 */
interface WrapperProps extends AtomicCommerceRecommendationListProps {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Product) => JSX.Element | Template;
}

/**
 * This component serves as a wrapper for the core AtomicCommerceRecommendationList.
 *
 * @param props
 * @returns
 */
export const ListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const commerceRecommendationListRef =
    useRef<HTMLAtomicCommerceRecommendationListElement>(null);
  useEffect(() => {
    commerceRecommendationListRef.current?.setRenderFunction(
      (product, root, linkContainer) => {
        const templateResult = template(product as Product);
        if (hasLinkTemplate(templateResult)) {
          createRoot(linkContainer!).render(templateResult.linkTemplate);
          createRoot(root).render(templateResult.contentTemplate);
          return renderToString(templateResult.contentTemplate);
        } else {
          createRoot(root).render(templateResult);
          otherProps.display === 'grid'
            ? createRoot(linkContainer!).render(
                <AtomicProductLink></AtomicProductLink>
              )
            : // biome-ignore lint/complexity/noUselessFragments: <>
              createRoot(linkContainer!).render(<></>);
          return renderToString(templateResult);
        }
      }
    );
  }, [otherProps.display, template]);
  return (
    <LitAtomicCommerceRecommendationList
      ref={commerceRecommendationListRef}
      {...otherProps}
    />
  );
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
