import {
  ResultList as ResultListController,
  ResultListState,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';
import ResultListCommon from '../../common/result-list';

interface ResultListProps {
  initialState: ResultListState;
  controller?: ResultListController;
}

export const ResultList: FunctionComponent<ResultListProps> = ({
  initialState,
  controller,
}) => {
  const [state, setState] = useState(initialState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return <ResultListCommon results={state.results} />;
};
