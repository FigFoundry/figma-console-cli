import React, { forwardRef, useEffect, useRef, useState } from 'react';
import '../../styles/components/commandLine.scss';

interface CommandLineProps {
  onCommand: (command: string) => void;
  onClear: () => void;
  history: string[];
  historyIndex: number;
  navigateHistory: (direction: 'up' | 'down') => void;
}

const CommandLine = forwardRef<HTMLDivElement, CommandLineProps>((props, ref) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle history navigation
  useEffect(() => {
    if (props.historyIndex >= 0 && props.historyIndex < props.history.length) {
      setInput(props.history[props.historyIndex]);
    }
  }, [props.historyIndex, props.history]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      if (command === 'clear') {
        props.onClear();
      } else if (command) {
        try {
          props.onCommand(command);
        } catch (error) {
          console.error('Command execution error:', error);
        }
      }
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      props.navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      props.navigateHistory('down');
    }
  };

  return (
    <div className="command-line" ref={ref}>
      <span className="command-line__prompt">%</span>
      <input
        ref={inputRef}
        type="text"
        className="command-line__input"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
});

export default CommandLine; 