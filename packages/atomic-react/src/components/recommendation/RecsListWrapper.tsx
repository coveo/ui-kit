import type {AtomicRecsList} from '@coveo/atomic/components';
import type {Result} from '@coveo/headless/recommendation';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {
  AtomicResultLink,
  AtomicRecsList as LitAtomicRecsList,
} from '../search/components.js';

interface Template {
  contentTemplate: JSX.Element;
  linkTemplate: JSX.Element;
}

interface AtomicRecsListProps {
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  density?: AtomicRecsList['density'];
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  display?: AtomicRecsList['display'];
  /**
   * The expected size of the image displayed for results.
   */
  imageSize?: AtomicRecsList['imageSize'];
  /**
   * The total number of recommendations to display.
   */
  numberOfRecommendations?: AtomicRecsList['numberOfRecommendations'];
  /**
   * The number of recommendations to display per page when using the carousel layout.
   */
  numberOfRecommendationsPerPage?: AtomicRecsList['numberOfRecommendationsPerPage'];
  /**
   * The non-localized label for the list of recommendations.
   */
  label?: AtomicRecsList['label'];
  /**
   * The heading level to use for the label, from 1 to 6.
   */
  headingLevel?: AtomicRecsList['headingLevel'];
}

interface HTMLAtomicRecsListElement extends AtomicRecsList, HTMLElement {}

// biome-ignore lint/correctness/noUnusedVariables: <>
var HTMLAtomicRecsListElement: {
  prototype: HTMLAtomicRecsListElement;
  new (): HTMLAtomicRecsListElement;
};

/**
 * The properties of the AtomicRecsList component
 */
interface WrapperProps extends AtomicRecsListProps {
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
  return <LitAtomicRecsList ref={recsListRef} {...otherProps} />;
};

const hasLinkTemplate = (
  template: JSX.Element | Template
): template is Template => {
  return (template as Template).linkTemplate !== undefined;
};
