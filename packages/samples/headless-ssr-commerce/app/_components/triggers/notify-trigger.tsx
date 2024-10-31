'use client';

import {useNotifyTrigger} from '@/app/_lib/commerce-engine';
import {useCallback, useEffect} from 'react';

// The notify trigger query example in the searchuisamples org is 'notify me'.
export default function NotifyTrigger() {
  const {state} = useNotifyTrigger();

  const notify = useCallback(() => {
    state.notifications.forEach((notification) => {
      alert(`Notification: ${notification}`);
    });
  }, [state.notifications]);

  useEffect(() => {
    notify();
  }, [notify]);

  return null;
}
