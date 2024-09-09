import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Product} from '@coveo/headless/commerce';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicCommerceProductList,
  AtomicProductLink,
} from '../stencil-generated/commerce/components';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

/**
 * The properties of the AtomicCommerceProductList component
 */
interface WrapperProps extends AtomicJSX.AtomicCommerceProductList {
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
        } else {
          createRoot(root).render(templateResult);
          createRoot(linkContainer!).render(
            <AtomicProductLink></AtomicProductLink>
          );
          return renderToString(templateResult);
        }
      }
    );
  }, [commerceProductListRef]);
  return (
    <AtomicCommerceProductList ref={commerceProductListRef} {...otherProps} />
  );
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
