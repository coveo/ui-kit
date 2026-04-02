export function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

export function extractComponentName(
  modulePath: string,
  storyId: string
): string | null {
  const componentPathMatch = modulePath.match(/\/((atomic-[a-z0-9-]+))\//i);
  if (componentPathMatch?.[1]) {
    return componentPathMatch[1].toLowerCase();
  }

  const storyPathMatch = modulePath.match(
    /(atomic-[a-z0-9-]+)\.new\.stories\.[jt]sx?$/i
  );
  if (storyPathMatch?.[1]) {
    return storyPathMatch[1].toLowerCase();
  }

  const storyIdMatch = storyId.match(/(atomic-[a-z0-9-]+)/i);
  if (storyIdMatch?.[1]) {
    return storyIdMatch[1].toLowerCase();
  }

  return null;
}
