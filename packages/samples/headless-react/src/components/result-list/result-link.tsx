import {Result, ResultAnalyticsActions} from '@coveo/headless';
import {FunctionComponent, useEffect} from 'react';
import {engine} from '../../engine';

interface LinkProps {
  result: Result;
}

export const ResultLink: FunctionComponent<LinkProps> = (props) => {
  let wasOpened = false;
  const onOpen = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(ResultAnalyticsActions.logDocumentOpen(props.result));
  };

  // 1 second is a reasonable amount of time to catch most longpress actions
  const longpressDelay = 1000;
  let longPressTimer: number;

  const startPressTimer = () => {
    longPressTimer = window.setTimeout(onOpen, longpressDelay);
  };
  const clearPressTimer = () => {
    longPressTimer && clearTimeout(longPressTimer);
  };

  useEffect(() => clearPressTimer);

  return (
    <a
      href={props.result.clickUri}
      onClick={onOpen}
      onContextMenu={onOpen}
      onMouseDown={onOpen}
      onMouseUp={onOpen}
      onTouchStart={startPressTimer}
      onTouchEnd={clearPressTimer}
    >
      {props.children}
    </a>
  );
};
