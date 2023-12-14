import { RelayEvent } from "../event/relay-event";
import { Storage } from "./storage";

export interface Environment {
  runtime: "browser" | "null";
  send: (url: string, token: string, event: RelayEvent) => Promise<void>;
  getReferrer: () => string | null;
  getLocation: () => string | null;
  getUserAgent: () => string | null;
  generateUUID: () => string;
  storage: Storage;
}
