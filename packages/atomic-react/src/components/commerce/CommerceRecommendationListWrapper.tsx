import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Product} from '@coveo/headless/commerce';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicCommerceRecommendationList} from '../stencil-generated/commerce';

/**
 * The properties of the AtomicCommerceRecommendationList component
 */
interface WrapperProps extends AtomicJSX.AtomicCommerceRecommendationList {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Product) => JSX.Element;
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
    commerceRecsListRef.current?.setRenderFunction((result, root) => {
      createRoot(root).render(template(result as Product));
      return renderToString(template(result as Product));
    });
  }, [commerceRecsListRef]);
  return (
    <AtomicCommerceRecommendationList
      ref={commerceRecsListRef}
      {...otherProps}
    />
  );
};
