import NotifyTrigger from './notify-trigger';
import QueryTrigger from './query-trigger';
import RedirectionTrigger from './redirection-trigger';

export default function Triggers() {
  return (
    <>
      <RedirectionTrigger />
      <QueryTrigger />
      <NotifyTrigger />
    </>
  );
}
