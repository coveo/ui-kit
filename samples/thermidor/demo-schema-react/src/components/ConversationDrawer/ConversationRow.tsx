import {useEffect, useId, useRef, useState, type KeyboardEvent} from 'react';
import {KebabIcon, PencilIcon, TrashIcon} from './drawer-icons.js';
import styles from './ConversationDrawer.module.css';

interface ConversationRowProps {
  title: string;
  current: boolean;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

/**
 * A saved conversation: its title opens it, and its menu renames it in place or deletes it. While
 * renaming, Enter saves and Escape cancels.
 */
export function ConversationRow({
  title,
  current,
  onOpen,
  onRename,
  onDelete,
}: ConversationRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = ({target}: PointerEvent) => {
      if (target instanceof Node && !rowRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    kebabRef.current?.focus();
  };

  const finishRename = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const renamed = event.currentTarget.value.trim();
      if (renamed && renamed !== title) {
        onRename(renamed);
      }
    } else if (event.key !== 'Escape') {
      return;
    }
    // Escape cancels the rename only, leaving the drawer open.
    event.stopPropagation();
    setRenaming(false);
    kebabRef.current?.focus();
  };

  if (renaming) {
    return (
      <div className={styles.row}>
        <input
          className={styles.rename}
          aria-label="Conversation title"
          defaultValue={title}
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- the rename the shopper just asked for
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={finishRename}
          onBlur={() => setRenaming(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={rowRef}
      className={styles.row}
      onKeyDown={(event) => {
        if (menuOpen && event.key === 'Escape') {
          event.stopPropagation();
          closeMenu();
        }
      }}
    >
      <button
        type="button"
        className={styles.open}
        aria-current={current ? 'true' : undefined}
        onClick={onOpen}
      >
        {title}
      </button>
      <button
        ref={kebabRef}
        type="button"
        className={styles.kebab}
        aria-label={`Options for ${title}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <KebabIcon />
      </button>
      {menuOpen && (
        <div id={menuId} role="menu" className={styles.menu} aria-label={`Options for ${title}`}>
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            // oxlint-disable-next-line jsx-a11y/no-autofocus -- a menu focuses its first item
            autoFocus
            onClick={() => {
              setMenuOpen(false);
              setRenaming(true);
            }}
          >
            <PencilIcon />
            Rename
          </button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={onDelete}>
            <TrashIcon />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
