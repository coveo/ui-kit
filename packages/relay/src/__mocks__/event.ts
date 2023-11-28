import { Meta } from "../event/meta/meta";
import { RelayEvent } from "../event/relay-event";
import { RelayPayload } from "../internal-types";

const defaultMeta: Meta = {
  type: "itemClick",
  config: {
    trackingId: "website",
  },
  ts: 1692057600000,
  source: "relay@0.0.5",
  clientId: "2136b353-74be-42d7-904f-ea33a8f4a43c",
  userAgent: null,
  referrer: null,
  location: null,
};

const defaultPayload: RelayPayload = {
  name: "I am name",
  searchUID: "I am Id",
};

interface Params {
  meta?: Partial<Meta>;
  payload?: RelayPayload;
}

export function createMockEvent(params?: Params): RelayEvent {
  return {
    ...defaultPayload,
    ...params?.payload,
    meta: { ...defaultMeta, ...params?.meta },
  };
}
