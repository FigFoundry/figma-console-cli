import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import '../../styles/components/commandLine.scss';

interface CommandLineProps {
  onCommand: (command: string) => void;
  onClear: () => void;
  history: string[];
  historyIndex: number;
  navigateHistory: (direction: 'up' | 'down') => void;
}

const CommandLine: React.FC<CommandLineProps> = ({
  onCommand,
  onClear,
  history,
  historyIndex,
  navigateHistory
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update input when navigating history
  useEffect(() => {
    if (historyIndex >= 0 && historyIndex < history.length) {
      setInput(history[historyIndex]);
    }
  }, [historyIndex, history]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      
      if (command === 'clear') {
        onClear();
      } else {
        onCommand(command);
      }
      
      // Clear input after command execution
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  return (
    <div className="command-line">
      <div className="command-line__prompt">%</div>
      <input
        ref={inputRef}
        type="text"
        className="command-line__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
};

export default CommandLine;