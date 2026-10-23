import styles from './FollowUpQuestions.module.css';

interface FollowUpQuestionsProps {
  questions: readonly string[];
  /** Asks `question` as the user's next message. */
  onSelect: (question: string) => void;
}

/** The questions an answer suggests asking next, each a button that asks it. */
export function FollowUpQuestions({questions, onSelect}: FollowUpQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }
  return (
    <div className={styles.container} role="group" aria-label="Follow-up questions">
      {questions.map((question) => (
        <button
          key={question}
          className={styles.question}
          onClick={() => onSelect(question)}
          type="button"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
