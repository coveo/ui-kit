import {useCallback, useEffect, useMemo, type ReactNode} from 'react';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {TargetingProvider, type TargetedProduct} from '../../context/targeting.js';
import {useTargetingMode} from '../../hooks/use-targeting-mode.js';
import type {SuggestionSection, SuggestionItem} from '../SuggestionsDropdown/index.js';
import styles from './ProductTargeting.module.css';

export interface ProductTargetingProps {
  products: TargetedProduct[];
  onProductsChange: (products: TargetedProduct[]) => void;
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
  promptProps?: {
    initialValue?: string;
    clearOnSubmit?: boolean;
    placeholder?: string;
    suggestions?: SuggestionSection[];
    onSuggestionSelect?: (item: SuggestionItem, sectionId: string) => void;
  };
  children: ReactNode;
}

export function ProductTargeting({
  products,
  onProductsChange,
  onSubmit,
  isStreaming,
  disabled = false,
  promptProps,
  children,
}: ProductTargetingProps) {
  const {isTargeting, stopTargeting, toggleTargeting} = useTargetingMode();

  useEffect(() => {
    if (isStreaming) {
      stopTargeting();
    }
  }, [isStreaming, stopTargeting]);

  const handleSubmitWithContext = useCallback(
    (prompt: string) => {
      stopTargeting();
      if (products.length > 0) {
        const names = products.map((p) => p.name).join(', ');
        onSubmit(`${prompt} [ADDITIONAL CONTEXT: ${names}]`);
      } else {
        onSubmit(prompt);
      }
    },
    [products, onSubmit, stopTargeting]
  );

  const handleProductTargeted = useCallback(
    (productId: string, productName: string, productThumbnail?: string) => {
      const existing = products.find((p) => p.id === productId);
      if (existing) {
        onProductsChange(products.filter((p) => p.id !== productId));
      } else {
        onProductsChange([
          ...products,
          {id: productId, name: productName, thumbnail: productThumbnail},
        ]);
      }
    },
    [products, onProductsChange]
  );

  const handleRemovePill = useCallback(
    (productId: string) => {
      if (isStreaming) return;
      onProductsChange(products.filter((p) => p.id !== productId));
    },
    [products, onProductsChange, isStreaming]
  );

  const handleClearAll = useCallback(() => {
    onProductsChange([]);
  }, [onProductsChange]);

  const selectedProductIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  const targetingContextValue = useMemo(
    () => ({
      isTargeting,
      onProductTargeted: handleProductTargeted,
      selectedProductIds,
    }),
    [isTargeting, handleProductTargeted, selectedProductIds]
  );

  const hintText = isTargeting ? 'Select products to attach' : 'Attach product context';

  return (
    <div className={styles.container}>
      <div className={styles.promptArea}>
        <PromptInput
          {...promptProps}
          onSubmit={handleSubmitWithContext}
          disabled={disabled || isStreaming}
        />
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.attachButton} ${isTargeting ? styles.attachButtonActive : ''}`}
            onClick={toggleTargeting}
            disabled={isStreaming}
            aria-label={isTargeting ? 'Stop targeting' : 'Attach product context'}
            aria-pressed={isTargeting}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={isTargeting ? '2.5' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <span className={styles.separator} />
          <span className={styles.pillsArea}>
            {products.length === 0 ? (
              <>
                <span className={styles.hintText}>{hintText}</span>
                {isTargeting && (
                  <button type="button" className={styles.doneButton} onClick={stopTargeting}>
                    Done
                  </button>
                )}
              </>
            ) : (
              <>
                {products.map((product) => (
                  <span
                    key={product.id}
                    className={`${styles.pill} ${isStreaming ? styles.pillDisabled : ''}`}
                    title={`${product.name} — click to remove`}
                    tabIndex={isStreaming ? -1 : 0}
                    role="button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => handleRemovePill(product.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRemovePill(product.id);
                      }
                    }}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className={styles.pillThumbnail}
                      />
                    ) : (
                      <span className={styles.pillPlaceholder} />
                    )}
                    <span className={styles.pillBadge} aria-hidden="true">
                      ×
                    </span>
                  </span>
                ))}
                {isTargeting ? (
                  <button type="button" className={styles.doneButton} onClick={stopTargeting}>
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClearAll}
                    disabled={isStreaming}
                  >
                    Clear
                  </button>
                )}
              </>
            )}
          </span>
        </div>
      </div>
      <TargetingProvider value={targetingContextValue}>
        <div className={isTargeting ? styles.targetingActive : undefined}>{children}</div>
      </TargetingProvider>
    </div>
  );
}
