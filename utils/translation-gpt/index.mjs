import {readFileSync, writeFileSync} from 'fs';
import {env} from 'process';

const fileToTranslate = JSON.parse(
  readFileSync('../../packages/atomic/src/locales.json')
);
const fileAlreadyTranslated = JSON.parse(readFileSync('./temporary.json'));

const allLanguages = [
  'en',
  'fr',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'fi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'pl',
  'pt',
  'pt-br',
  'ru',
  'sv',
  'th',
  'tr',
  'zh',
  'zh-cn',
  'zh-tw',
];

const prompt = (mainKey, toTranslate, languages) =>
  `I will give you a string to translate. The string can possible contain variables between braces similar to this: {{variable}}. 
  Those variables are meant to represent dynamic values.
  If there are no variable, then do a normal translation.
  I want you to translate it in the language code ${languages.join(
    ', '
  )} and to place the variable with braces correctly in the new string if it applies.
  For each language code, answer in valid JSON format, with the the main key being ${mainKey} and each individual language code is a property of ${mainKey}. 
  The value of each property of ${mainKey} should be the translated string.
  The string to translate is: 
  "${toTranslate}"`;

async function main() {
  for (const translationKey of Object.keys(fileToTranslate)) {
    if (fileAlreadyTranslated[translationKey]) {
      continue;
    }

    const englishTranslation = fileToTranslate[translationKey]['en'];
    const existingTranslation = Object.keys(fileToTranslate[translationKey]);
    const keysThatNeedTranslation = allLanguages.filter(
      (l) => existingTranslation.indexOf(l) === -1
    );

    if (keysThatNeedTranslation.length === 0) {
      fileAlreadyTranslated[translationKey] = fileToTranslate[translationKey];
      writeFileSync(
        'temporary.json',
        JSON.stringify(fileAlreadyTranslated, null, 2)
      );
      continue;
    }

    try {
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
              content: prompt(
                translationKey,
                englishTranslation,
                keysThatNeedTranslation
              ),
            },
          ],
          stream: false,
        }),
      });

      const data = await res.json();
      const answer = data.choices[0].message.content;

      fileAlreadyTranslated[translationKey] = {
        ...fileToTranslate[translationKey],
        ...JSON.parse(answer)[translationKey],
      };
      writeFileSync(
        'temporary.json',
        JSON.stringify(fileAlreadyTranslated, null, 2)
      );

      console.log(`${answer}`);
    } catch (e) {
      console.error(`Error while translating ${translationKey} : ${e}.`);
      console.error(
        'Troubleshoot the issue, then restart to script to continue translation.'
      );
    }
  }

  writeFileSync(
    '../../packages/atomic/src/locales.json',
    readFileSync('temporary.json')
  );
  writeFileSync('temporary.json', JSON.stringify({}, null, 2));
}

main();
