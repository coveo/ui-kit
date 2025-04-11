import prettier from 'prettier';

export async function formatWithPrettier(content, filePath) {
  try {
    const options = await prettier.resolveConfig(filePath);
    return prettier.format(content, {...options, filepath: filePath});
  } catch (error) {
    console.warn(`Failed to format ${filePath} with Prettier`, error);
    return content;
  }
}
