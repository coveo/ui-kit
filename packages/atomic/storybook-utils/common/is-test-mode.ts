export function isTestMode(): boolean {
  return (
    typeof window !== 'undefined' && window.location.href.includes('localhost')
  );
}
