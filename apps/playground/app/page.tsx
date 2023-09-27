"use client";
import { createRelay, ValidationResponse } from "@coveo/relay";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import styles from "./styles.module.css";
import { EventDropdown } from "./validator/event-dropdown";
import { Report } from "./validator/report";
import { events } from "./events";

export default function Page() {
  const { emit } = createRelay({
    token: "xx3d20bc92-afb6-4b7f-90b6-abb568085ea8",
    organizationId: "aduiorgtestdonotdeletepleaseas62tcf4",
    host: "https://platformdev.cloud.coveo.com",
    trackingId: "playground",
    mode: "validate",
  });

  function prettify(obj: Object) {
    return JSON.stringify(obj, null, 2);
  }

  const initialEvent = events[0];

  const [event, setEvent] = useState(initialEvent);
  const [payload, setPayload] = useState(prettify(initialEvent.payload));
  const [validationResponse, setValidationResponse] =
    useState<ValidationResponse>();
  const isResettable = prettify(event.payload) !== payload;

  async function send() {
    const response = (await emit(
      event.type,
      JSON.parse(payload)
    )) as ValidationResponse;
    setValidationResponse(response);
  }

  function reset() {
    setPayload(prettify(event.payload));
    setValidationResponse(null);
  }

  function onSelectEvent(selected: string) {
    const selectedEvent = events.find((event) => event.type === selected);
    setEvent(selectedEvent);
    setPayload(prettify(selectedEvent.payload));
    setValidationResponse(null);
  }

  return (
    <div className={styles.container}>
      <h1>Relay</h1>
      <EventDropdown
        events={events}
        selectedEventType={event.type}
        onSelectEvent={onSelectEvent}
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
            value={payload}
            options={{ minimap: { enabled: false }, contextmenu: false }}
            onChange={setPayload}
          />
        </div>
        <div className={styles.section}>
          {validationResponse ? <Report report={validationResponse} /> : null}
        </div>
      </div>
    </div>
  );
}
