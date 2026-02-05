import type {AtomicResultList} from '@coveo/atomic/components';
import type {Result} from '@coveo/headless';
import React, {type JSX, useEffect, useRef} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {
  AtomicResultLink,
  AtomicResultList as LitAtomicResultList,
} from './components.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

interface AtomicResultListProps {
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  density?: AtomicResultList['density'];
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  display?: AtomicResultList['display'];
  /**
   * The expected size of the image displayed for results.
   */
  imageSize?: AtomicResultList['imageSize'];
  /**
   * The desired number of placeholders to display while the result list is loading.
   */
  numberOfPlaceholders?: number;
}

interface HTMLAtomicResultListElement extends AtomicResultList, HTMLElement {}

// biome-ignore lint/correctness/noUnusedVariables: <>
var HTMLAtomicResultListElement: {
  prototype: HTMLAtomicResultListElement;
  new (): HTMLAtomicResultListElement;
};

/**
 * The properties of the AtomicResultList component
 */
interface WrapperProps extends AtomicResultListProps {
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
    });
  }, [otherProps.display, template]);
  return <LitAtomicResultList ref={resultListRef} {...otherProps} />;
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
      ? linkRoot.render(<AtomicResultLink></AtomicResultLink>)
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
