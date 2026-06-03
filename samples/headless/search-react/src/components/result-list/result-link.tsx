import {buildInteractiveResult, type Result} from '@coveo/headless';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import {AppContext} from '../../context/engine';
import {filterProtocol} from '../../utils/filter-protocol';

interface LinkProps extends PropsWithChildren {
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
