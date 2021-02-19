import {buildInteractiveResult, Result} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  const interactiveResult = buildInteractiveResult(engine, {
    options: {result: props.result},
  });

  useEffect(() => () => interactiveResult.cancelPendingSelect(), []);

  return (
    <a
      href={props.result.clickUri}
      onClick={() => interactiveResult.select()}
      onContextMenu={() => interactiveResult.select()}
      onMouseDown={() => interactiveResult.select()}
      onMouseUp={() => interactiveResult.select()}
      onTouchStart={() => interactiveResult.beginDelayedSelect()}
      onTouchEnd={() => interactiveResult.cancelPendingSelect()}
    >
      {props.children}
    </a>
  );
};
