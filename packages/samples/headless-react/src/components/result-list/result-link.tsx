import {buildResultLinkAnalytics, Result} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  const resultLinkAnalytics = buildResultLinkAnalytics(engine, {
    options: {result: props.result},
  });

  useEffect(() => () => resultLinkAnalytics.cancelPendingSelect(), []);

  return (
    <a
      href={props.result.clickUri}
      onClick={() => resultLinkAnalytics.select()}
      onContextMenu={() => resultLinkAnalytics.select()}
      onMouseDown={() => resultLinkAnalytics.select()}
      onMouseUp={() => resultLinkAnalytics.select()}
      onTouchStart={() => resultLinkAnalytics.beginDelayedSelect()}
      onTouchEnd={() => resultLinkAnalytics.cancelPendingSelect()}
    >
      {props.children}
    </a>
  );
};
