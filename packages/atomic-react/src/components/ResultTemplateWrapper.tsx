import React, {useEffect, useRef} from 'react';
import type {JSX} from '@coveo/atomic';
import {AtomicResultTemplate} from './stencil-generated';
import {mapToHTMLProperties} from './MapToHTMLProperties';

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
      {children}
    </AtomicResultTemplate>
  );
};
