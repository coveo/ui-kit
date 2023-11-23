"use client";
import { createRelay } from "@coveo/relay";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import styles from "./styles.module.css";
import { EventDropdown } from "./validator/event-dropdown";
import { events } from "./events";

export default function Page() {
  const organizationId = "aduiorgtestdonotdeletepleaseas62tcf4";

  const { emit } = createRelay({
    url: `https://${organizationId}.analytics.orgdev.coveo.com/rest/organizations/${organizationId}/events/v1`,
    token: "xx3d20bc92-afb6-4b7f-90b6-abb568085ea8",
    trackingId: "playground",
    mode: "emit",
  });

  function prettify(obj: Object) {
    return JSON.stringify(obj, null, 2);
  }

  const initialEvent = events[0];

  const [event, setEvent] = useState(initialEvent);
  const [payload, setPayload] = useState(prettify(initialEvent.payload));
  const isResettable = prettify(event.payload) !== payload;

  function send() {
    emit(event.type, JSON.parse(payload));
  }

  function reset() {
    setPayload(prettify(event.payload));
  }

  function onSelectEvent(selected: string) {
    const selectedEvent = events.find((event) => event.type === selected);
    setEvent(selectedEvent);
    setPayload(prettify(selectedEvent.payload));
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
          <h2>How to validate event(s) with the Explorer chrome extension</h2>
          <ol>
            <li>
              To use a local version of the extension, follow these{" "}
              <a
                href={
                  "https://github.com/coveo/explorer/blob/main/packages/explorer/README.md"
                }
                target="_blank"
              >
                instructions
              </a>
            </li>
            <li>
              {
                "After the extension is installed, click on the extension's icon to toggle on."
              }
            </li>
            <li>Expand the Explorer widget to see the validated events list</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
