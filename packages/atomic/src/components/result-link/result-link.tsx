import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../utils/xss-utils';
import {InteractiveResult} from '@coveo/headless';

export interface ResultLinkProps {
  interactiveResult: InteractiveResult;
  href: string;
  target: string;
  part?: string;
  title?: string;
  ref?: (elm?: HTMLAnchorElement) => void;
}

export const LinkWithResultAnalytics: FunctionalComponent<ResultLinkProps> = (
  {href, interactiveResult, target, part, title, ref},
  children
) => {
  const stopPropagationAndProcess = (e: Event, process: () => void) => {
    e.stopPropagation();
    process();
  };
  return (
    <a
      part={part}
      href={filterProtocol(href)}
      title={title}
      onClick={(e) => stopPropagationAndProcess(e, interactiveResult.select)}
      onContextMenu={(e) =>
        stopPropagationAndProcess(e, interactiveResult.select)
      }
      onMouseDown={(e) =>
        stopPropagationAndProcess(e, interactiveResult.select)
      }
      onMouseUp={(e) => stopPropagationAndProcess(e, interactiveResult.select)}
      onTouchStart={(e) =>
        stopPropagationAndProcess(e, interactiveResult.beginDelayedSelect)
      }
      onTouchEnd={(e) =>
        stopPropagationAndProcess(e, interactiveResult.cancelPendingSelect)
      }
      target={target}
      ref={ref}
    >
      {children}
    </a>
  );
};
