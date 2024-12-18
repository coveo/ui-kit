import {useQueryTrigger} from '@/lib/commerce-engine';

// The query trigger query example in the searchuisamples org is 'query me'.
export default function QueryTrigger() {
  const {state} = useQueryTrigger();

  if (state.wasQueryModified) {
    return (
      <div>
        The query changed from <b>{state.originalQuery}</b> to{' '}
        <b>{state.newQuery}</b>
      </div>
    );
  }
  return null;
}
