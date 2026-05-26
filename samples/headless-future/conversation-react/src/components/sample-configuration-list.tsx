interface SampleConfigurationListProps {
  configuration: {
    organizationId: string;
    trackingId: string;
    language: string;
    country: string;
    currency: string;
  };
}

export function SampleConfigurationList({
  configuration,
}: SampleConfigurationListProps) {
  return (
    <ul>
      <li>organizationId: {configuration.organizationId}</li>
      <li>trackingId: {configuration.trackingId}</li>
      <li>language: {configuration.language}</li>
      <li>country: {configuration.country}</li>
      <li>currency: {configuration.currency}</li>
    </ul>
  );
}
