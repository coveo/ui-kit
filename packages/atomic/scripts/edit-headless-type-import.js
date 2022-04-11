const replace = require('replace-in-file');

async function main() {
  const options = {
    files: './dist/types/**',
    from: "from '@coveo/headless'",
    to: "from '@coveo/atomic/headless'",
  };

  try {
    const results = await replace(options);
    console.log(
      `Edited ${results.filter((result) => result.hasChanged).length} d.ts files, replacing @coveo/headless import.`
    );
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
main();
