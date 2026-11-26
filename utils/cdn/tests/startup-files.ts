const relativeStaticImports = (code: string) =>
  [...code.matchAll(/\b(?:from|import)\s*["']\.\/([^"']+)["']/g)].map(([, file]) => file);

/**
 * The Atomic files a page downloads before `entry` can run: the entry and everything it imports statically, as file
 * name to code. Requires `serveCdnAsIs()`.
 */
export const startupFiles = async (entry: string) => {
  const files = new Map<string, string>();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (!files.has(file)) {
      const code = await (await fetch(`/atomic/v3/${file}`)).text();
      files.set(file, code);
      pending.push(...relativeStaticImports(code));
    }
  }
  return files;
};
