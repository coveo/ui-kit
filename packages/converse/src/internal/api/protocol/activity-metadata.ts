export function getActivityMetadata(event: unknown): {id?: string; replace?: boolean} {
  if (typeof event !== 'object' || event === null) {
    return {};
  }

  const activity = event as {messageId?: unknown; replace?: unknown};
  return {
    ...(typeof activity.messageId === 'string' ? {id: activity.messageId} : {}),
    ...(activity.replace === true ? {replace: true} : {}),
  };
}
