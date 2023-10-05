'use client';

import ResultListCommon from '../common/result-list';
import {useResultList} from '../../lib/react/engine';

export default function ResultList() {
  const {state} = useResultList();

  return <ResultListCommon results={state.results} />;
}
