export function findSmartSnippetStyleTag(host: HTMLElement) {
  return (
    host.querySelector('template')?.content.querySelector('style') ?? undefined
  );
}
