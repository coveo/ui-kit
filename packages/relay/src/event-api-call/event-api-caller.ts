import { Environment } from "../environment/environment";
import { RelayOptions } from "../relay";
import { RelayEvent } from "../event/relay-event";

export interface EventApiCallParams {
  event: Readonly<RelayEvent>;
  options: RelayOptions;
  environment: Environment;
  validate?: boolean;
}

export async function callEventApi({
  event,
  options,
  environment,
  validate,
}: EventApiCallParams): Promise<any> {
  const { token, host, organizationId } = options;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await environment.fetch(
    `${host}/rest/organizations/${organizationId}/events/v1${
      validate ? "/validate" : ""
    }`,
    {
      method: "POST",
      body: JSON.stringify([event]),
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error({
      responseType: "serviceError",
      ...data,
    });
  }

  return data;
}
