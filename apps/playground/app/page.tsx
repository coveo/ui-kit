"use client";
import { createRelay, ValidationReport } from "@coveo/relay";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import styles from "./styles.module.css";
import { EventDropdown } from "./validator/event-dropdown";
import { Report } from "./validator/report";
import { getEvents } from "./events";

export default function Page() {
  const { validate } = createRelay({
    token: "xx3d20bc92-afb6-4b7f-90b6-abb568085ea8",
    organizationId: "aduiorgtestdonotdeletepleaseas62tcf4",
    host: "https://platformdev.cloud.coveo.com",
    trackingId: "playground",
  });

  const events = getEvents();
  const initialEvent = events[0];
  const prettify = (obj: Object) => JSON.stringify(obj, null, 2);
  const defaultPayload = prettify(initialEvent.payload);

  const [selectedEventType, setSelectedEventType] = useState(initialEvent.type);
  const [event, setEvent] = useState(defaultPayload);
  const [validationReport, setValidationReport] = useState<ValidationReport>();
  const isResettable = event !== defaultPayload;

  async function send() {
    const response = await validate(selectedEventType, JSON.parse(event));
    setValidationReport(response);
  }

  function reset() {
    setEvent(defaultPayload);
    setValidationReport(null);
  }

  return (
    <div className={styles.container}>
      <h1>Relay</h1>
      <EventDropdown
        events={events}
        selectedEventType={selectedEventType}
        onSelectEvent={setSelectedEventType}
      />
      <div className={styles.controls}>
        <button onClick={send}>Send</button>
        {isResettable ? <button onClick={reset}>Reset</button> : null}
      </div>
      <div className={styles.main}>
        <div className={styles.section}>
          <Editor
            language="json"
            theme="vs-dark"
            value={event}
            options={{ minimap: { enabled: false }, contextmenu: false }}
            onChange={setEvent}
          />
        </div>
        <div className={styles.section}>
          {validationReport ? <Report report={validationReport} /> : null}
        </div>
      </div>
    </div>
  );
}
