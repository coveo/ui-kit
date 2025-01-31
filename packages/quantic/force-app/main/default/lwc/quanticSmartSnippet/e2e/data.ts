import {QuestionAnswerData} from '../../../../../../playwright/page-object/searchObjectWithSmartSnippet';

const exampleQuestion = 'Where was Gondor when the Westfold fell?';
const exampleAnswerSnippet = `<a href="#">Gondor</a> was on the brink of destruction when the Westfold fell. Gondor did not come to Rohan's aid when the Westfold fell because it was overwhelmed by its own dire circumstances and unable to spare resources or manpower. The alliance between the two kingdoms, forged by the Oath of Eorl, was based on a promise of mutual defense in times of extreme need. However, by the time of the War of the Ring, Gondor was facing unprecedented threats from Sauron, whose forces in Mordor were massing for a full-scale assault on Minas Tirith. The Steward of Gondor, Denethor II, was deeply concerned about the security of his own kingdom and could not afford to weaken its defenses to send aid across the vast distances that separated Gondor from the Westfold. Even if assistance had been feasible, the logistical challenge of moving troops through potentially hostile territory would have delayed their arrival, rendering their efforts ineffective. Moreover, the threat to Rohan came not only from Sauron's influence but also from the unexpected betrayal of Saruman, who, until then, had been perceived as an ally. His treachery, combined with the swiftness and brutality of his attacks, left Rohan vulnerable and isolated, as neither Rohan nor Gondor had anticipated such aggression from Isengard. While the alliance between the two realms remained strong in spirit, Gondor's immediate need to safeguard its own survival against the growing shadow of Mordor took precedence, leaving Rohan to fend for itself during the fall of the Westfold.`;
const exampleScore = 0.42;
const exampleContentIdKey = 'permanentid';
const mockPermanentId = '1234';
const exampleContentIdValue = mockPermanentId;

const smartSnippetData: QuestionAnswerData = {
  answerFound: true,
  question: exampleQuestion,
  answerSnippet: exampleAnswerSnippet,
  documentId: {
    contentIdKey: exampleContentIdKey,
    contentIdValue: exampleContentIdValue,
  },
  score: exampleScore,
};

export default smartSnippetData;
