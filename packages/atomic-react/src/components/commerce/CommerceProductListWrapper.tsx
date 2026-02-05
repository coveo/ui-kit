import type {AtomicCommerceProductList} from '@coveo/atomic/components';
import type {Product} from '@coveo/headless/commerce';
import React, {type JSX, useEffect, useRef} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
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
  density?: AtomicCommerceProductList['density'];
  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  display?: AtomicCommerceProductList['display'];
  /**
   * The expected size of the image displayed for products.
   */
  imageSize?: AtomicCommerceProductList['imageSize'];
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
      (result, root, linkContainer) => {
        const templateResult = template(result as Product);
        if (isTemplate(templateResult)) {
          return renderTemplate(linkContainer, templateResult, root);
        } else {
          return renderJSXTemplate(
            linkContainer,
            root,
            templateResult,
            otherProps.display
          );
        }
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

const isTemplate = (template: JSX.Element | Template): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};

function renderJSXTemplate(
  linkContainer: HTMLElement | undefined,
  root: HTMLElement,
  templateResult: JSX.Element,
  display: WrapperProps['display']
) {
  const contentRoot = createRoot(root);
  const linkRoot = linkContainer ? createRoot(linkContainer!) : null;
  flushSync(() => {
    contentRoot.render(templateResult);
    if (!linkRoot) {
      return;
    }
    display === 'grid'
      ? linkRoot.render(<AtomicProductLink></AtomicProductLink>)
      : // biome-ignore lint/complexity/noUselessFragments: <>
        linkRoot.render(<></>);
  });
  return root.innerHTML;
}

function renderTemplate(
  linkContainer: HTMLElement | undefined,
  templateResult: Template,
  root: HTMLElement
) {
  const linkRoot = createRoot(linkContainer!);
  const contentRoot = createRoot(root);
  flushSync(() => {
    linkRoot.render(templateResult.linkTemplate);
    contentRoot.render(templateResult.contentTemplate);
  });
  return root.innerHTML;
}
