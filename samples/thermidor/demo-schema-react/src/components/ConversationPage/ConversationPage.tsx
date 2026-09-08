import type {Turn} from '@coveo/thermidor';
import {useRef} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import type {TargetedProduct} from '../../context/targeting.js';
import {ProductTargeting} from '../ProductTargeting/ProductTargeting.js';
import {ConversationThread} from './ConversationThread.js';
import styles from './ConversationPage.module.css';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  turns: Turn[];
  onBackToSearch: () => void;
  canGoBackToSearch: boolean;
  products: TargetedProduct[];
  onProductsChange: (products: TargetedProduct[]) => void;
}

export function ConversationPage({
  onSubmit,
  isStreaming,
  turns,
  onBackToSearch,
  canGoBackToSearch,
  products,
  onProductsChange,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns, isStreaming});

  return (
    <section className={styles.page}>
      <div className={styles.promptAtBottom}>
        <ProductTargeting
          products={products}
          onProductsChange={onProductsChange}
          onSubmit={onSubmit}
          isStreaming={isStreaming}
          promptProps={{clearOnSubmit: true}}
        >
          <div
            className={styles.scrollContainer}
            ref={containerRef}
            aria-busy={isStreaming}
            role="log"
            aria-label="Conversation history"
          >
            <div className={styles.scrollContent}>
              <ConversationThread turns={turns} turnRefs={turnRefs} />
            </div>
          </div>
        </ProductTargeting>
      </div>
      {canGoBackToSearch && (
        <button
          type="button"
          className={styles.floatingBackButton}
          onClick={onBackToSearch}
          title="Back to search results"
          aria-label="Back to search results"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      )}
    </section>
  );
}
