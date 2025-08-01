import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {env} from 'node:process';

const keysToValidate = process.argv.slice(2);

const fileToValidate = JSON.parse(
  readFileSync('../../packages/atomic/src/locales.json')
);

if (!existsSync('temporary.json')) {
  openSync('temporary.json', 'w');
}

writeFileSync('temporary.json', JSON.stringify({}));

const prompt = (translations) =>
  `I want you to translate strings to english. 
  
  I will give you a JSON object where each key is a language code, and each value is the string to translate to english. 
  The string can possibly contain variables between braces similar to this: {{variable}}.
  Those variables are meant to represent dynamic values.
  
  I will also give you a validator string where the key will be "validator" in the JSON object. The "validator" key should not be translated.
  
  Give me the answer back in JSON format where each key is the language code, and each value is an object with two property: "translation" and "validation".
  
  "translation" Should be the translated string in english.
  If the meaning of the "translation" is similar to the "validator" property "validation" should contain exactly and only true. Else it should contain an explanation on why "validator" is different from the "translation".
  
  The JSON object is: 
  
  ${JSON.stringify(translations, null, 2)}
  `;

async function main() {
  let allIdentifiedProblems = {};

  for (const translationKey of Object.keys(fileToValidate)) {
    if (keysToValidate.length > 0 && !keysToValidate.includes(translationKey))
      continue;
    try {
      const englishTranslation = fileToValidate[translationKey].en;
      const translationsToValidate = fileToValidate[translationKey];
      delete translationsToValidate.en;

      const res = await fetch(env.COVEO_AZURE_OPEN_AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.COVEO_AZURE_OPEN_AI_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt({
                ...translationsToValidate,
                validator: englishTranslation,
              }),
            },
          ],
          stream: false,
        }),
      });

      const data = await res.json();
      const answer = JSON.parse(data.choices[0].message.content);

      Object.entries(answer).forEach(
        ([languageCode, {validation, translation}]) => {
          if (validation !== true) {
            const problem = {
              languageCode,
              translation,
              validation,
              validator: englishTranslation,
              translationKeyToVerify: translationKey,
            };

            console.error('!!! Potential problem to verify !!!');
            console.error(problem);

            allIdentifiedProblems = {
              [translationKey]: {[languageCode]: {...problem}},
              ...allIdentifiedProblems,
            };
          }
        }
      );
      console.log(`Finished validating ${translationKey}...`);
    } catch (e) {
      console.error(e);
    }
  }
  writeFileSync('temporary.json', JSON.stringify(allIdentifiedProblems));
}

main();
