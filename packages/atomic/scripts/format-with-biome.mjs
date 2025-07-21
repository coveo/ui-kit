import {execSync} from 'node:child_process';

export async function formatWithBiome(content, filePath) {
  try {
    // Use stdin for in-memory formatting, just like prettier.format()
    const result = execSync(`biome format --stdin-file-path="${filePath}"`, {
      input: content,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return result;
  } catch (error) {
    console.warn(`Failed to format ${filePath} with Biome`, error);
    return content;
  }
}
