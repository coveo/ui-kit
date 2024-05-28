import {FunctionalComponent} from '@stencil/core';
import {LocalizedString} from '../../../utils/jsx-utils';

interface QueryCorrectionTagLineProps {}
export const QueryCorrectionTagLine: FunctionalComponent<
  QueryCorrectionTagLineProps
> = () => {
  return (
    <LocalizedString
      bindings={this.bindings}
      key={key}
      params={{query: <b part="highlight">{query}</b>}}
    />
  );
};
