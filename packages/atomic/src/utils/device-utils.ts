export function isIOS() {
  // Source: https://stackoverflow.com/a/58065241
  const platform = navigator.platform;
  if (!platform) {
    return false;
  }
  return (
    /iPad|iPhone|iPod/.test(platform) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}
