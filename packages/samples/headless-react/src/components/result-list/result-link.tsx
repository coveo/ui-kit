import {buildResultLink, Result} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  const resultLink = buildResultLink(engine, {
    options: {result: props.result},
  });

  useEffect(() => () => resultLink.cancelPendingSelect(), []);

  return (
    <a
      href={props.result.clickUri}
      onClick={() => resultLink.select()}
      onContextMenu={() => resultLink.select()}
      onMouseDown={() => resultLink.select()}
      onMouseUp={() => resultLink.select()}
      onTouchStart={() => resultLink.beginDelayedSelect()}
      onTouchEnd={() => resultLink.cancelPendingSelect()}
    >
      {props.children}
    </a>
  );
};
