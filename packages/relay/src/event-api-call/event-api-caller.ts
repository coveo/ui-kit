import { Environment } from "../environment/environment";
import { RelayOptions } from "../relay";
import { RelayEvent } from "../event/relay-event";

export interface EventApiCallParams {
  event: Readonly<RelayEvent>;
  options: RelayOptions;
  environment: Environment;
}

export type RelayMode = "emit" | "validate";

export async function callEventApi({
  event,
  options,
  environment,
}: EventApiCallParams): Promise<any> {
  const { token, host, organizationId } = options;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await environment.fetch(
    `${host}/rest/organizations/${organizationId}/events/v1${
      options.mode == "validate" ? "/validate" : ""
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
