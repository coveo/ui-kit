import {useQueryTrigger} from '@/lib/commerce-engine';

// Submit the query 'query me' from the search box to activate the query trigger.
export default function QueryTrigger() {
  const {state} = useQueryTrigger();

  if (!state.wasQueryModified) {
    return null;
  }

  return (
    <div className="QueryTrigger">
      <p>
        {' '}
        The query changed from <b>{state.originalQuery}</b> to{' '}
        <b>{state.newQuery}</b>
      </p>
    </div>
  );
}
