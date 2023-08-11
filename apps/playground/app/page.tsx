import { createRelay } from "@coveo/relay";

export default function Page() {
  createRelay().log();

  return (
    <>
      <h1>Relay</h1>
    </>
  );
}
