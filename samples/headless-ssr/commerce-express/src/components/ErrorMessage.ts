export function ErrorMessage(message?: string): string {
  if (!message) return '';
  return `
    <div id="query-error" class="ErrorMessage">
      <p>${message}</p>
    </div>
  `;
}
