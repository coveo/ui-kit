import {buildInteractiveResult, Result} from '@coveo/headless';
import {FunctionComponent, useContext, useEffect} from 'react';
import {AppContext} from '../../context/engine';
import {filterProtocol} from '../../utils/filter-protocol';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  const {engine} = useContext(AppContext);

  const interactiveResult = buildInteractiveResult(engine!, {
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
