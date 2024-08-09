import {
  QueryTrigger as QueryTriggerController,
  QueryTriggerState,
  RedirectionTrigger as RedirectionTriggerController,
  RedirectionTriggerState,
  NotifyTrigger as NotifyTriggerController,
  NotifyTriggerState,
} from '@coveo/headless/commerce';
import NotifyTrigger from './notify-trigger';
import QueryTrigger from './query-trigger';
import RedirectionTrigger from './redirection-trigger';

interface TriggersProps {
  redirectionController?: RedirectionTriggerController;
  redirectionStaticState: RedirectionTriggerState;
  queryDontroller?: QueryTriggerController;
  queryStaticState: QueryTriggerState;
  notifyController?: NotifyTriggerController;
  notifyStaticState: NotifyTriggerState;
}
export default function Triggers({
  redirectionStaticState,
  redirectionController,
  queryStaticState,
  queryDontroller,
  notifyStaticState,
  notifyController,
}: TriggersProps) {
  return (
    <>
      <RedirectionTrigger
        staticState={redirectionStaticState}
        controller={redirectionController}
      />
      <QueryTrigger
        staticState={queryStaticState}
        controller={queryDontroller}
      />
      <NotifyTrigger
        staticState={notifyStaticState}
        controller={notifyController}
      />
    </>
  );
}
