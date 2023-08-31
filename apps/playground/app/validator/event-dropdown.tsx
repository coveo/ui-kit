import { SampleEvent } from "../events";
import styles from "../styles.module.css";

interface EventDropdownProps {
  events: SampleEvent[];
  selectedEventType: string;
  onSelectEvent: (selected: string) => void;
}

export function EventDropdown({
  events,
  selectedEventType,
  onSelectEvent,
}: EventDropdownProps) {
  return (
    <select
      name="events"
      id="events"
      className={styles["events-selector"]}
      value={selectedEventType}
      onChange={(event) => onSelectEvent(event.target.value)}
    >
      {events?.map(({ type }) => (
        <option value={type} key={`key-${type}`}>
          {type}
        </option>
      ))}
    </select>
  );
}
