"use client";

import { createRelay } from "@coveo/relay";
import Editor from "@monaco-editor/react";
import styles from "./styles.module.css";
import { useState } from "react";
import { ecPurchase } from "./events";

export default function Page() {
  createRelay().log();

  const prettify = (obj: Object) => JSON.stringify(obj, null, 2);
  const defaultEvent = prettify(ecPurchase);

  const [event, setEvent] = useState(defaultEvent);
  const [message, setMessage] = useState("");

  const modified = event !== defaultEvent;
  const reset = () => setEvent(defaultEvent);
  const send = () => {
    console.log(event);
    setMessage("validation error");
  };

  return (
    <div className={styles.container}>
      <h1>Relay</h1>
      <div className={styles.controls}>
        <button onClick={send}>Send</button>
        {modified ? <button onClick={reset}>Reset</button> : null}
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
          {message && <div className={styles["validation-box"]}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
