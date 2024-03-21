import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once} from '../../../utils/utils';

export interface ResultListBreakpointsProps {
  host: HTMLElement;
}

export const ResultListBreakpoints: FunctionalComponent<
  ResultListBreakpointsProps
> = ({host}, children) => {
  const updateBreakpointsOnlyOnce = once(() => {
    updateBreakpoints(host);
  });
  updateBreakpointsOnlyOnce();
  return <Fragment>{...children}</Fragment>;
};
