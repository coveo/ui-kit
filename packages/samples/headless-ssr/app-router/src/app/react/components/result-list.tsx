'use client';

import ResultListCommon from '../../../common/result-list';
import {useResultList} from '../common/engine';

export default function ResultList() {
  const {state} = useResultList();

  return <ResultListCommon results={state.results} />;
}
