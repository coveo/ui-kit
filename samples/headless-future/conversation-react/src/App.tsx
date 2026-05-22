import {useEffect} from 'react';
import {buildSampleEngine} from './engine.js';
import {getSampleConfiguration} from './env.js';

interface SampleConfiguration {
  organizationId: string;
  accessToken: string;
  trackingId: string;
  language: string;
  country: string;
  currency: string;
}

export default function App() {
  const configuration: SampleConfiguration = getSampleConfiguration();

  useEffect(() => {
    buildSampleEngine();
  }, []);

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
