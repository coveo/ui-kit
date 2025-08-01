import {useNotifyTrigger} from '@/lib/commerce-engine';

// Submit the query 'notify me' from the search box to activate the notification trigger.
// A notification trigger is also automatically activated when accessing the Surf Accessories listing page.
export default function NotifyTrigger() {
  const {state} = useNotifyTrigger();

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="NotifyTrigger">
      <h3>Notifications:</h3>
      <ul>
        {state.notifications.map((notification) => (
          <li key={`${notification}`}>{notification}</li>
        ))}
      </ul>
    </div>
  );
}
