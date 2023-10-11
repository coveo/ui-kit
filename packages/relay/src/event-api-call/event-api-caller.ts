import { Environment } from "../environment/environment";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../config/config";
import { ValidationResponse } from "../relay";

export interface EventApiCallParams {
  config: RelayConfig;
  environment: Environment;
  event: Readonly<RelayEvent>;
}

export async function callEventApi<T>({
  event,
  config,
  environment,
}: EventApiCallParams): Promise<T> {
  const { url, token } = config;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await environment.fetch(
    `${url}${config.mode == "validate" ? "/validate" : ""}`,
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
