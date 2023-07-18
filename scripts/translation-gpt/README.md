# Purpose

The purpose of these scripts (`translate.mjs` and `validate.mjs`) is to generate new translations for entries added to the Atomic `locales.json` file.

The scripts rely on an LLM accessible only to Coveo employees and there are a few steps that need to be followed to execute them correctly.

## Prerequisites

Before running these scripts locally, you must first set a couple of environment variables.

To retrieve the appropriate values, load the Coveo LLM environment and interact with the chat bot. You can access this environment at https://demos.coveodemo.com/gpt/index.html. Once loaded, look in the network console for the required values.

You must set both of the following environment variables:

- `COVEO_AZURE_OPEN_AI_ENDPOINT`
- `COVEO_AZURE_OPEN_AI_KEY`

## translate.mjs

To run this script, navigate to `./scripts/translation-gpt` and use the command `node translate.mjs`.

While executing the script, a `temporary.json` file will be generated. Do not delete this file while the translation task is ongoing.

The script will look at all values that need translation from `locales.json`, which are those that do not have all defined values in `supportedLanguages` as defined in `translate.mjs`.

If there are a lot of translations that need to be performed, the script could take several hours to run. The `temporary.json` file is used to save progress in the event that the script needs to be restarted due to a transient error.

## validate.mjs

To run this script, navigate to `./scripts/translation-gpt` and use the command `node validate.mjs`.

- This will validate all entries in the `locales.json` file.
- To validate only selected entries (e.g. recent additions) pass them as space seperated command line arguments
  e.g. `node validate.mjs query-suggestion-label between-parentheses`

While executing the script, a `temporary.json` file will be generated. Do not delete this file while the validation task is ongoing.

Once the script has finished executing, you can view the report contained in `temporary.json`.

The script attempts to confirm that all values in `locales.json` are semantically correct. While it is not a perfect system and may create some false positives, it should be able to validate the majority of values on its own. Any false positives can then be manually validated by a human using other tools.
