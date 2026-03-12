export function ErrorMessage(message?: string): string {
  if (!message) return '';
  return `
    <div id="query-error" class="query-error">
      <p>${message}</p>
    </div>
  `;
}
