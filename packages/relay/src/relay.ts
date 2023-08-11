import { currentEnvironment } from "./environment/environment";

export function createRelay() {
  const environment = currentEnvironment();
  const message =
    environment.runtime === "browser" ? "hello browser" : "hello node";

  return {
    log: () => console.log(message),
  };
}
