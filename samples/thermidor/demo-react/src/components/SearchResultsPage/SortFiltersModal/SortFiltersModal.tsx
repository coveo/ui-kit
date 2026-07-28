import {useEffect, useRef} from 'react';
import {SortPlaceholder} from '../SortPlaceholder/SortPlaceholder.js';
import styles from './SortFiltersModal.module.css';

interface SortFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onToast: () => void;
}

export function SortFiltersModal({open, onClose, onToast}: SortFiltersModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleClose = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-label="Sort and filters">
      <div className={styles.header}>
        <h2 className={styles.title}>Sort & Filters</h2>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <div className={styles.scrollContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Sort</h3>
          <SortPlaceholder onToast={onToast} />
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Filters</h3>
          <p className={styles.placeholder}>Filters coming soon</p>
        </section>
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.viewResultsButton} onClick={handleClose}>
          View results
        </button>
      </div>
    </dialog>
  );
}
