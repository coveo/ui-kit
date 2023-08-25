"use client";

import {
  createRelay,
  ServiceErrorResponse,
  ValidationError,
  ValidationReport,
} from "@coveo/relay";
import Editor from "@monaco-editor/react";
import styles from "./styles.module.css";
import { useState } from "react";
import { ecPurchase } from "./events";

export default function Page() {
  const { validate } = createRelay({
    token: "xx3d20bc92-afb6-4b7f-90b6-abb568085ea8",
    organizationId: "aduiorgtestdonotdeletepleaseas62tcf4",
    host: "https://platformdev.cloud.coveo.com",
    trackingId: "playground",
  });
  const prettify = (obj: Object) => JSON.stringify(obj, null, 2);
  const defaultEvent = prettify(ecPurchase);

  const [event, setEvent] = useState(defaultEvent);
  const [validationReport, setValidationReport] = useState<ValidationReport>();

  const modified = event !== defaultEvent;
  const reset = () => setEvent(defaultEvent);
  const send = async () => {
    const response = await validate("ecPurchase", JSON.parse(event));
    setValidationReport(response);
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
          {validationReport ? (
            <Report validationReport={validationReport} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Report({ validationReport }: { validationReport: ValidationReport }) {
  if (validationReport.responseType === "serviceError") {
    return (
      <div className={styles["validation-box"]}>
        <h2>{`Is valid?: ${validationReport.valid}`}</h2>
        <ServiceErrorSection serviceErrorResponse={validationReport} />
      </div>
    );
  }

  return (
    <div className={styles["validation-box"]}>
      <h2>{`Is valid?: ${validationReport.valid}`}</h2>
      {validationReport.errors.length > 0 ? (
        <ValidationErrorsSection errors={validationReport.errors} />
      ) : null}
    </div>
  );
}

function ServiceErrorSection({
  serviceErrorResponse,
}: {
  serviceErrorResponse: ServiceErrorResponse;
}) {
  return (
    <>
      <h2>Error: </h2>
      <div className={styles["validation-box"]}>
        <ErrorAttribute
          type="Error Code"
          value={serviceErrorResponse.errorCode}
        />
        <ErrorAttribute type="Message" value={serviceErrorResponse.message} />
        <ErrorAttribute
          type="Request ID"
          value={serviceErrorResponse.requestID}
        />
      </div>
    </>
  );
}

function ValidationErrorsSection({ errors }: { errors: ValidationError[] }) {
  return (
    <>
      <h2>With errors: </h2>
      {errors.map((error: ValidationError, index: number) => (
        <div className={styles["validation-box"]} key={`key-error-${index}`}>
          <ErrorAttribute type="Type" value={error.type} />
          <ErrorAttribute type="Message" value={error.message} />
          {error.path ? (
            <ErrorAttribute type="Path" value={error.path} />
          ) : null}
        </div>
      ))}
    </>
  );
}

function ErrorAttribute({ type, value }: { type: string; value: string }) {
  return (
    <span>
      <b>{`${type}: `}</b>
      <p>{value}</p>
    </span>
  );
}
