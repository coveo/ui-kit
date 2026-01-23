import type {
  ResultList as ResultListController,
  ResultListState,
} from '@coveo/headless/ssr';
import {type FunctionComponent, useEffect, useState} from 'react';
import ResultListCommon from '../common/result-list';

interface ResultListProps {
  staticState: ResultListState;
  controller?: ResultListController;
}

export const ResultList: FunctionComponent<ResultListProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return <ResultListCommon results={state.results} />;
};
