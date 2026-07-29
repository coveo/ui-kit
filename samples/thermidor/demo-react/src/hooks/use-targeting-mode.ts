import {useCallback, useEffect, useState} from 'react';

interface UseTargetingModeReturn {
  isTargeting: boolean;
  startTargeting: () => void;
  stopTargeting: () => void;
  toggleTargeting: () => void;
}

export function useTargetingMode(): UseTargetingModeReturn {
  const [isTargeting, setIsTargeting] = useState(false);

  const startTargeting = useCallback(() => {
    setIsTargeting(true);
  }, []);

  const stopTargeting = useCallback(() => {
    setIsTargeting(false);
  }, []);

  const toggleTargeting = useCallback(() => {
    setIsTargeting((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isTargeting) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTargeting(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTargeting]);

  return {isTargeting, startTargeting, stopTargeting, toggleTargeting};
}
