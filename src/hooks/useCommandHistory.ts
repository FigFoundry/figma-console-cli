import { useState } from 'react';

export const useCommandHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (command: string) => {
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (history.length === 0) return;
    
    setHistoryIndex(prev => {
      if (direction === 'up') {
        return prev < history.length - 1 ? prev + 1 : history.length - 1;
      } else {
        return prev > -1 ? prev - 1 : -1;
      }
    });
  };

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory
  };
};