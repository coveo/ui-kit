import {existsSync, openSync, readFileSync, writeFileSync} from 'node:fs';
import {env} from 'node:process';

const localeToTranslate = JSON.parse(
  readFileSync('../../packages/atomic/src/locales.json')
);

if (!existsSync('temporary.json')) {
  openSync('temporary.json', 'w');
  writeFileSync('temporary.json', JSON.stringify({}));
}

const localeAlreadyTranslated = JSON.parse(readFileSync('./temporary.json'));

const supportedLanguages = [
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
  'pt-BR',
  'ru',
  'sv',
  'th',
  'tr',
  'zh',
  'zh-CN',
  'zh-TW',
];

const prompt = (
  translationKey,
  englishTranslation,
  languagesThatNeedTranslation
) =>
  `I will give you a string to translate. The string can optionally contain variables between braces similar to this: {{variable}}. 
  Those variables are meant to represent dynamic values.
  If there is no variable present, then do a normal translation.
  I want you to translate it in the following language codes ${languagesThatNeedTranslation.join(
    ', '
  )} and to place the variable with braces correctly in the new string if it applies.
  For each language code, answer in valid JSON format, with the the main key being ${translationKey} and each individual language code is a property of ${translationKey}. 
  The value of each property of ${translationKey} should be the translated string.
  The string to translate is: 
  "${englishTranslation}"`;

async function main() {
  for (const translationKey of Object.keys(localeToTranslate)) {
    if (localeAlreadyTranslated[translationKey]) {
      continue;
    }

    const englishTranslation = localeToTranslate[translationKey].en;
    const existingTranslation = Object.keys(localeToTranslate[translationKey]);
    const languagesThatNeedTranslation = supportedLanguages.filter(
      (l) => !existingTranslation.includes(l)
    );

    if (languagesThatNeedTranslation.length === 0) {
      localeAlreadyTranslated[translationKey] =
        localeToTranslate[translationKey];
      writeFileSync(
        'temporary.json',
        JSON.stringify(localeAlreadyTranslated, null, 2)
      );
      continue;
    }

    console.log(
      `${translationKey}: Fetching translation for ${languagesThatNeedTranslation.length} languages from API.`
    );

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
                languagesThatNeedTranslation
              ),
            },
          ],
          stream: false,
        }),
      });

      const data = await res.json();
      const answer = data.choices[0].message.content;

      localeAlreadyTranslated[translationKey] = {
        ...localeToTranslate[translationKey],
        ...JSON.parse(answer)[translationKey],
      };
      writeFileSync(
        'temporary.json',
        JSON.stringify(localeAlreadyTranslated, null, 2)
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
    `${readFileSync('temporary.json')}\n`
  );
  writeFileSync('temporary.json', JSON.stringify({}, null, 2));
}

main();
