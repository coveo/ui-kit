import {
  ServiceErrorResponse,
  ValidationError,
  ValidationReport,
} from "@coveo/relay";
import styles from "../styles.module.css";

interface AttributeProps {
  type: string;
  value: string;
}

interface ServiceErrorSectionProps {
  serviceErrorResponse: ServiceErrorResponse;
}

interface ValidationErrorsSectionProps {
  errors: ValidationError[];
}

interface ReportProps {
  report: ValidationReport;
}

function Attribute({ type, value }: AttributeProps) {
  return (
    <span>
      <b>{`${type}: `}</b>
      <p>{value}</p>
    </span>
  );
}

function ServiceErrorSection({
  serviceErrorResponse,
}: ServiceErrorSectionProps) {
  return (
    <>
      <h2>Error: </h2>
      <div className={styles["validation-box"]}>
        <Attribute type="Error Code" value={serviceErrorResponse.errorCode} />
        <Attribute type="Message" value={serviceErrorResponse.message} />
        <Attribute type="Request ID" value={serviceErrorResponse.requestID} />
      </div>
    </>
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
  if (report.responseType === "serviceError") {
    return (
      <div className={styles["validation-box"]}>
        <h2>{`Is valid?: ${report.valid}`}</h2>
        <ServiceErrorSection serviceErrorResponse={report} />
      </div>
    );
  }

  return (
    <div className={styles["validation-box"]}>
      <h2>{`Is valid?: ${report.valid}`}</h2>
      {report.errors.length > 0 ? (
        <ValidationErrorsSection errors={report.errors} />
      ) : null}
    </div>
  );
}
