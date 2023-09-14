import { ValidationError, ValidationResponse } from "@coveo/relay";
import styles from "../styles.module.css";

interface AttributeProps {
  type: string;
  value: string;
}

interface ValidationErrorsSectionProps {
  errors: ValidationError[];
}

interface ReportProps {
  report: ValidationResponse;
}

function Attribute({ type, value }: AttributeProps) {
  return (
    <span>
      <b>{`${type}: `}</b>
      <p>{value}</p>
    </span>
  );
}

function ValidationErrorsSection({ errors }: ValidationErrorsSectionProps) {
  return (
    <>
      <h2>With errors: </h2>
      {errors.map((error: ValidationError, index: number) => (
        <div className={styles["validation-box"]} key={`key-error-${index}`}>
          <Attribute type="Type" value={error.type} />
          <Attribute type="Message" value={error.message} />
          {error.path ? <Attribute type="Path" value={error.path} /> : null}
        </div>
      ))}
    </>
  );
}

export function Report({ report }: ReportProps) {
  return (
    <div className={styles["validation-box"]}>
      <h2>{`Is valid?: ${report.valid}`}</h2>
      {report.errors.length > 0 ? (
        <ValidationErrorsSection errors={report.errors} />
      ) : null}
    </div>
  );
}
