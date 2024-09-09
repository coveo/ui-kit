import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/headless';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicResultLink,
  AtomicResultList,
} from '../stencil-generated/search/components';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

/**
 * The properties of the AtomicResultList component
 */
interface WrapperProps extends AtomicJSX.AtomicResultList {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Result) => JSX.Element | Template;
}

/**
 * This component serves as a wrapper for the core AtomicResultList.
 *
 * @param props
 * @returns
 */
export const ResultListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const resultListRef = useRef<HTMLAtomicResultListElement>(null);
  useEffect(() => {
    resultListRef.current?.setRenderFunction((result, root, linkContainer) => {
      const templateResult = template(result as Result);
      if (hasLinkTemplate(templateResult)) {
        createRoot(linkContainer!).render(templateResult.linkTemplate);
        createRoot(root).render(templateResult.contentTemplate);
        return renderToString(templateResult.contentTemplate);
      } else {
        createRoot(root).render(templateResult);
        createRoot(linkContainer!).render(
          <AtomicResultLink></AtomicResultLink>
        );
        return renderToString(templateResult);
      }
    });
  }, [resultListRef]);
  return <AtomicResultList ref={resultListRef} {...otherProps} />;
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
