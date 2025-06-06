export function sanitizeHtml(html: string): string {
  // Remove HTML comments
  let sanitized = html.replace(/<!--.*?-->/gs, '');
  // Remove leading/trailing whitespace between tags
  sanitized = sanitized.replace(/>\s+</g, '><');
  // Collapse multiple spaces
  sanitized = sanitized.replace(/\s{2,}/g, ' ');
  // Trim
  sanitized = sanitized.trim();
  return sanitized;
}
