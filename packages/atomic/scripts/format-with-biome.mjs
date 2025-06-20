import {execSync} from 'node:child_process';
import {writeFileSync, mkdtempSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

export async function formatWithBiome(content, filePath) {
  try {
    // Create a temporary file with the content
    const tempDir = mkdtempSync(join(tmpdir(), 'biome-format-'));
    const tempFile = join(
      tempDir,
      'temp' + (filePath.endsWith('.ts') ? '.ts' : '.js')
    );

    writeFileSync(tempFile, content);

    // Run biome format on the temporary file
    execSync(`biome format --write "${tempFile}"`, {stdio: 'pipe'});

    // Read the formatted content
    const formattedContent = readFileSync(tempFile, 'utf8');

    return formattedContent;
  } catch (error) {
    console.warn(`Failed to format ${filePath} with Biome`, error);
    return content;
  }
}
