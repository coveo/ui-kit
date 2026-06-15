import { Select } from "@mantine/core";
import { SampleEvent } from "../events";

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
    <Select
      data={events.map((e) => e.type)}
      value={selectedEventType}
      onChange={(value) => value && onSelectEvent(value)}
    />
  );
}
