import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Product} from '@coveo/headless/commerce';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicCommerceRecommendationList,
  AtomicProductLink,
} from '../stencil-generated/commerce/index.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

/**
 * The properties of the AtomicCommerceRecommendationList component
 */
interface WrapperProps extends AtomicJSX.AtomicCommerceRecommendationList {
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
  const commerceRecsListRef =
    useRef<HTMLAtomicCommerceRecommendationListElement>(null);
  useEffect(() => {
    commerceRecsListRef.current?.setRenderFunction(
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
            : createRoot(linkContainer!).render(<></>);
          return renderToString(templateResult);
        }
      }
    );
  }, [commerceRecsListRef]);
  return (
    <AtomicCommerceRecommendationList
      ref={commerceRecsListRef}
      {...otherProps}
    />
  );
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
