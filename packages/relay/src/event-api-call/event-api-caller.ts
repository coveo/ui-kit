import { Environment } from "../environment/environment";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../config/config";

export interface EventApiCallParams {
  config: RelayConfig;
  environment: Environment;
  event: Readonly<RelayEvent>;
}

export async function callEventApi({
  event,
  config,
  environment,
}: EventApiCallParams): Promise<any> {
  const { token, host, organizationId } = config;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await environment.fetch(
    `${host}/rest/organizations/${organizationId}/events/v1${
      config.mode == "validate" ? "/validate" : ""
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
      ...data,
    });
  }

  return data;
}
