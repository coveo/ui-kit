import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/headless/recommendation';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicResultLink} from '../search/components.js';
import {AtomicRecsList} from '../stencil-generated/search/index.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

/**
 * The properties of the AtomicRecsList component
 */
interface WrapperProps extends AtomicJSX.AtomicRecsList {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Result) => JSX.Element | Template;
}

/**
 * This component serves as a wrapper for the core AtomicRecsList.
 *
 * @param props
 * @returns
 */
export const RecsListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const recsListRef = useRef<HTMLAtomicRecsListElement>(null);
  useEffect(() => {
    recsListRef.current?.setRenderFunction((result, root, linkContainer) => {
      const templateResult = template(result as Result);
      if (hasLinkTemplate(templateResult)) {
        createRoot(linkContainer!).render(templateResult.linkTemplate);
        createRoot(root).render(templateResult.contentTemplate);
        return renderToString(templateResult.contentTemplate);
      } else {
        createRoot(root).render(templateResult);
        otherProps.display === 'grid'
          ? createRoot(linkContainer!).render(
              <AtomicResultLink></AtomicResultLink>
            )
          : // biome-ignore lint/complexity/noUselessFragments: <>
            createRoot(linkContainer!).render(<></>);
        return renderToString(templateResult);
      }
    });
  }, [otherProps.display, template]);
  return <AtomicRecsList ref={recsListRef} {...otherProps} />;
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
