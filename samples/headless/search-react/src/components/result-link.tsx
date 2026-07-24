import {buildInteractiveResult, type Result, type SearchEngine} from '@coveo/headless';
import {type PropsWithChildren, useEffect, useMemo} from 'react';
import {filterProtocol} from '../utils/filter-protocol';

interface ResultLinkProps extends PropsWithChildren {
  engine: SearchEngine;
  result: Result;
}

/**
 * Renders a result title as a link and logs a click analytics event when the
 * result is opened. The `interactiveResult` controller is what turns a plain
 * anchor into a tracked result: this usage data feeds Coveo ML models such as
 * query suggestions and recommendations.
 */
export function ResultLink({engine, result, children}: ResultLinkProps) {
  const interactiveResult = useMemo(
    () => buildInteractiveResult(engine, {options: {result}}),
    [engine, result]
  );

  useEffect(() => () => interactiveResult.cancelPendingSelect(), [interactiveResult]);

  return (
    <a
      className="result__title"
      href={filterProtocol(result.clickUri)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => interactiveResult.select()}
      onContextMenu={() => interactiveResult.select()}
      onMouseDown={() => interactiveResult.select()}
      onMouseUp={() => interactiveResult.select()}
      onTouchStart={() => interactiveResult.beginDelayedSelect()}
      onTouchEnd={() => interactiveResult.cancelPendingSelect()}
    >
      {children}
    </a>
  );
}
