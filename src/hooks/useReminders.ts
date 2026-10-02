import { useState, useCallback } from 'react';
import { Reminder } from '../types';
import { getReminders, saveReminders } from '../lib/storage';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => getReminders());

  const addReminder = useCallback(
    (title: string, dueDate?: string, dueTime?: string) => {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}`,
        title: title.trim(),
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [newReminder, ...reminders];
      saveReminders(updated);
      setReminders(updated);
      return newReminder;
    },
    [reminders]
  );

  const toggleReminder = useCallback(
    (id: string) => {
      const updated = reminders.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      );
      saveReminders(updated);
      setReminders(updated);
    },
    [reminders]
  );

  const updateReminder = useCallback(
    (updatedReminder: Reminder) => {
      const updated = reminders.map((r) =>
        r.id === updatedReminder.id ? updatedReminder : r
      );
      saveReminders(updated);
      setReminders(updated);
    },
    [reminders]
  );

  const deleteReminder = useCallback(
    (id: string) => {
      const updated = reminders.filter((r) => r.id !== id);
      saveReminders(updated);
      setReminders(updated);
    },
    [reminders]
  );

  const refreshReminders = useCallback(() => {
    setReminders(getReminders());
  }, []);

  return {
    reminders,
    addReminder,
    updateReminder,
    toggleReminder,
    deleteReminder,
    refreshReminders,
  };
};
