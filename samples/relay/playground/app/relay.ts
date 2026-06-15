import { createRelay } from "@coveo/relay";

const url = process.env["NEXT_PUBLIC_EVENTS_URL"]!;
const token = process.env["NEXT_PUBLIC_TOKEN"]!;
const trackingId = process.env["NEXT_PUBLIC_TRACKING_ID"]!;

const relay = createRelay({ url, token, trackingId });

export { relay };
