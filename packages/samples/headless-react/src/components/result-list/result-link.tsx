import {buildResultSelectionHelpers, Result} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  const resultSelectionHelpers = buildResultSelectionHelpers(
    engine,
    props.result
  );

  useEffect(() => resultSelectionHelpers.cancelPendingSelect(), []);

  return (
    <a
      href={props.result.clickUri}
      onClick={() => resultSelectionHelpers.select()}
      onContextMenu={() => resultSelectionHelpers.select()}
      onMouseDown={() => resultSelectionHelpers.select()}
      onMouseUp={() => resultSelectionHelpers.select()}
      onTouchStart={() => resultSelectionHelpers.beginDelayedSelect()}
      onTouchEnd={() => resultSelectionHelpers.cancelPendingSelect()}
    >
      {props.children}
    </a>
  );
};
