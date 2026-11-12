interface HydrationMetadataCommonProps {
  hydrated: boolean;
  resultCount?: number;
}

export default function HydrationMetadataCommon({
  hydrated,
  resultCount,
}: HydrationMetadataCommonProps) {
  return (
    <>
      <div>
        Hydrated: <input id="hydrated-indicator" type="checkbox" disabled checked={hydrated} />
      </div>
      {resultCount !== undefined && (
        <span id="hydrated-msg">Rendered page with {resultCount} results</span>
      )}
      <div>
        Rendered on{' '}
        <span id="timestamp" suppressHydrationWarning>
          {new Date().toISOString()}
        </span>
      </div>
    </>
  );
}
