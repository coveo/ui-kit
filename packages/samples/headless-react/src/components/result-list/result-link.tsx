import {buildInteractiveResult, Result} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

function filterProtocol(uri: string) {
  // Filters out some URIs such as `javascript:`.
  const isAbsolute = /^(https?|ftp|file|mailto|tel):/i.test(uri);
  const isRelative = /^\//.test(uri);

  return isAbsolute || isRelative ? uri : '';
}

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
      href={filterProtocol(props.result.clickUri)}
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
