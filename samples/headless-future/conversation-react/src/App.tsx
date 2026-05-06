import {useMemo} from 'react';
import {buildSampleEngine} from './engine.js';

interface SampleConfiguration {
  organizationId: string;
  accessToken: string;
  trackingId: string;
  language: string;
  country: string;
  currency: string;
}

interface SampleState {
  configuration?: SampleConfiguration;
}

export default function App() {
  const engine = useMemo(() => buildSampleEngine(), []);
  const configuration = engine.read<SampleConfiguration | undefined>(
    (state: SampleState) => state.configuration
  );

  return (
    <main>
      <h1>Headless Future Conversation Sample</h1>
      <p>Engine initialized from environment variables.</p>
      <ul>
        <li>organizationId: {configuration?.organizationId}</li>
        <li>trackingId: {configuration?.trackingId}</li>
        <li>language: {configuration?.language}</li>
        <li>country: {configuration?.country}</li>
        <li>currency: {configuration?.currency}</li>
      </ul>
    </main>
  );
}
