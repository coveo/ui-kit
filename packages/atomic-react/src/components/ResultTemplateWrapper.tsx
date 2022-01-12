import type {JSX} from '@coveo/atomic';
import React, {useEffect, useRef} from 'react';
import ReactDOMServer from 'react-dom/server';
import {mapToHTMLProperties} from './MapToHTMLProperties';
import {AtomicResultTemplate} from './stencil-generated';

interface MatchConditions {
  mustMatch?: Record<string, string[]>;
  mustNotMatch?: Record<string, string[]>;
}
interface WrapperProps extends JSX.AtomicResultTemplate, MatchConditions {}

export const ResultTemplateWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const {children, mustMatch, mustNotMatch, ...allOtherProps} = props;
  const mustMatchAsHTMLProperties = mustMatch
    ? mapToHTMLProperties('must-match', mustMatch)
    : [];
  const mustNotMatchAsHTMLProperties = mustNotMatch
    ? mapToHTMLProperties('must-not-match', mustNotMatch)
    : [];

  const innerHTML = ReactDOMServer.renderToStaticMarkup(<>{children}</>);

  const resultTemplateRef = useRef<HTMLAtomicResultTemplateElement>(null);
  useEffect(() => {
    mustMatchAsHTMLProperties
      .concat(mustNotMatchAsHTMLProperties)
      .forEach(([attribute, value]) => {
        resultTemplateRef.current?.setAttribute(attribute, value);
      });
  }, [resultTemplateRef]);
  return (
    <AtomicResultTemplate ref={resultTemplateRef} {...allOtherProps}>
      <template dangerouslySetInnerHTML={{__html: innerHTML}}></template>
    </AtomicResultTemplate>
  );
};
