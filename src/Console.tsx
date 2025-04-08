import React, { useState, useEffect, useRef } from 'react';
import CommandLine from './components/Console/CommandLine';
import CommandOutput from './components/Console/CommandOutput';
import { useCommandHistory } from './hooks/useCommandHistory';
import { executeCommand } from './utils/commandUtils';
import { CommandResult } from './types/commands';
import './styles/components/console.scss';

const Console: React.FC = () => {
  const [outputs, setOutputs] = useState<CommandResult[]>([{
    command: '',
    output: "Type 'help' to see available commands.",
    isError: false
  }]);
  
  const { history, addToHistory, navigateHistory, historyIndex } = useCommandHistory();
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleCommand = async (command: string) => {
    // Skip empty commands
    if (!command.trim()) return;
    
    // Add to history
    addToHistory(command);
    
    // Execute the command and get result
    const result = await executeCommand(command);
    
    // Update outputs
    setOutputs(prevOutputs => [...prevOutputs, {
      command,
      output: result.output,
      isError: result.isError
    }]);
  };
  
  const handleClear = () => {
    setOutputs([]);
  };
  
  // Scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [outputs]);

  return (
    <div className="console" ref={consoleRef}>      
      <div className="console__content">
        <CommandOutput outputs={outputs} />
        <CommandLine 
          onCommand={handleCommand} 
          onClear={handleClear}
          history={history}
          historyIndex={historyIndex}
          navigateHistory={navigateHistory}
        />
      </div>
    </div>
  );
};

export default Console;