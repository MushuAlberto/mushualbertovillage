import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  baseKey: string,
  initialValue: T,
  userId: string | null
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const getStorageKey = useCallback(() => {
    return userId ? `${baseKey}_${userId}` : null;
  }, [baseKey, userId]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const storageKey = getStorageKey();
    if (!storageKey || typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${storageKey}”:`, error);
      return initialValue;
    }
  });

  // Effect to re-initialize state when userId changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey || typeof window === 'undefined') {
      // If no user or called server-side, reset to initialValue if current value isn't already initialValue
      // This check prevents unnecessary state updates if initialValue itself is complex or causes re-renders
      if (JSON.stringify(storedValue) !== JSON.stringify(initialValue)) {
         setStoredValue(initialValue);
      }
      return;
    }
    try {
      const item = window.localStorage.getItem(storageKey);
      const newValue = item ? JSON.parse(item) : initialValue;
       if (JSON.stringify(storedValue) !== JSON.stringify(newValue)) {
        setStoredValue(newValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${storageKey}” in effect:`, error);
      if (JSON.stringify(storedValue) !== JSON.stringify(initialValue)) {
        setStoredValue(initialValue);
      }
    }
  // storedValue is intentionally omitted from deps here to avoid re-running this effect when storedValue changes due to setItem.
  // We only want this effect to run when the key (due to userId) or initialValue changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStorageKey, initialValue]);


  // Effect to update localStorage when storedValue changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(storedValue));
      } catch (error) {
         console.error(`Error setting localStorage key “${storageKey}”:`, error);
      }
    }
  }, [getStorageKey, storedValue]);
  
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      setStoredValue(value);
    } catch (error) {
      const storageKey = getStorageKey();
      console.error(`Error in setValue for localStorage key “${storageKey || baseKey}”:`, error);
    }
  };

  // Listen to storage changes from other tabs/windows
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        if (event.newValue !== null) {
          if (event.newValue !== JSON.stringify(storedValue)) { // Check if value actually changed
            try {
              setStoredValue(JSON.parse(event.newValue));
            } catch (error) {
              console.error(`Error parsing storage event value for key “${storageKey}”:`, error);
            }
          }
        } else {
           // Item was removed in another tab. Reset to initialValue if not already there.
          if (JSON.stringify(storedValue) !== JSON.stringify(initialValue)) {
            setStoredValue(initialValue);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getStorageKey, initialValue, storedValue]);

  return [storedValue, setValue];
}