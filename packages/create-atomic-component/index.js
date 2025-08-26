#!/usr/bin/env node
import '@coveo/create-atomic-component-project';
import {
  cpSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

/***************** TODO: CDX-1428: Move to @coveo/create-atomic-commons package ******************/
class SerializableAggregateError extends AggregateError {
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      options: this.options,
      errors: Array.from(this.errors),
    };
  }
}

const handleErrors = (error) => {
  if (process.channel) {
    process.send(error);
    process.exit(1);
  } else {
    throw error;
  }
};

const successMessage = () => {
  console.log(`
  Project successfully configured

  We suggest that you begin by typing:

  $ npm install
  $ npm start

  $ npm start
    Starts the development server.

  $ npm run build
    Builds your project in production mode.

  Happy coding!

  Further reading:
    https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components
  `);
};

const camelize = (str) =>
  str
    .replace(/-(.)/g, (_, group) => group.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase());
const transform = (transformers) => {
  for (const {srcPath, destPath, transform} of transformers) {
    if (!srcPath) {
      continue;
    }
    if (!destPath) {
      unlinkSync(srcPath);
      continue;
    }
    renameSync(srcPath, destPath);
    if (transform) {
      writeFileSync(destPath, transform(readFileSync(destPath, 'utf8')));
    }
  }
};

// Adapted from Stencil: https://github.com/ionic-team/stencil/blob/main/src/utils/validation.ts
/**
 * Validates that a component tag meets required naming conventions to be used for a web component
 * @param tag the tag to validate
 * @returns an error message if the tag has an invalid name, undefined if the tag name passes all checks
 */
const ensureComponentValidity = (tag) => {
  const errors = [];
  const alphaAndHyphenOnly = /^[a-z-]+$/;
  const forbiddenLeadingHyphen = /^-/;
  const forbiddenTrailingHyphen = /-$/;
  const forbiddenMultiHyphen = /-{2,}/;
  const shouldContainAtLeastOneHyphen = /-/;

  if (!alphaAndHyphenOnly.test(tag)) {
    errors.push(`"${tag}" can only contain lower case alphabetical characters`);
  }
  if (forbiddenLeadingHyphen.test(tag)) {
    errors.push(`"${tag}" cannot start with a dash (-)`);
  }
  if (forbiddenTrailingHyphen.test(tag)) {
    errors.push(`"${tag}" cannot end with a dash (-)`);
  }
  if (!shouldContainAtLeastOneHyphen.test(tag)) {
    errors.push(
      `"${tag}" must contain a dash (-) to work as a valid web component`
    );
  }
  if (forbiddenMultiHyphen.test(tag)) {
    errors.push(
      `"${tag}" cannot contain multiple dashes (--) next to each other`
    );
  }

  if (errors.length > 0) {
    handleErrors(
      new SerializableAggregateError(errors, 'Invalid component tag name')
    );
  }
};

/***********************************/
const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);

cpSync(templateDirPath, cwd(), {
  recursive: true,
});

const componentName = process.argv[2];
if (componentName) {
  ensureComponentValidity(componentName);
  const transformers = [
    {
      srcPath: 'src/components/sample-component',
      destPath: `src/components/${componentName}`,
    },
    {
      srcPath: `src/components/${componentName}/src/sample-component.tsx`,
      destPath: `src/components/${componentName}/src/${componentName}.tsx`,
      transform: (text) =>
        text
          .replaceAll(/sample-component/g, componentName)
          .replaceAll(/SampleComponent/g, camelize(componentName)),
    },
    {
      srcPath: `src/components/${componentName}/src/sample-component.css`,
      destPath: `src/components/${componentName}/src/${componentName}.css`,
    },
    {
      srcPath: `src/components/${componentName}/package.json`,
      destPath: `src/components/${componentName}/package.json`,
      transform: (text) => {
        const transformedText = text.replaceAll(
          /(@coveo\/)?sample-component/g,
          componentName
        );

        const packageJson = JSON.parse(transformedText);

        if (packageJson.scripts) {
          const newScripts = {};
          for (const [key, value] of Object.entries(packageJson.scripts)) {
            const newKey = key.startsWith('!') ? key.substring(1) : key;
            newScripts[newKey] = value;
          }
          packageJson.scripts = newScripts;
        }

        return JSON.stringify(packageJson, null, 2);
      },
    },
  ];

  transform(transformers);
}

successMessage();
