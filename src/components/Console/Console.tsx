import React, { useState, useEffect, useRef } from 'react';
import CommandLine from './CommandLine';
import CommandOutput from './CommandOutput';
import { useCommandHistory } from '../../hooks/useCommandHistory';
import { executeCommand } from '../../utils/commandUtils';
import { CommandResult } from '../../types/commands';
import '../../styles/components/console.scss';

const Console: React.FC = () => {
  const [outputs, setOutputs] = useState<CommandResult[]>([{
    command: '',
    output: `
   ______                       __   
  / ____/___  ____  _________  / /__ 
 / /   / __ \\/ __ \\/ ___/ __ \\/ / _ \\
/ /___/ /_/ / / / (__  ) /_/ / /  __/
\\____/\\____/_/ /_/____/\\____/_/\\___/ 

-----------------------------------------------------
Type 'help' to see available commands.
-----------------------------------------------------
`,
    isError: false
  }]);
  
  const { history, addToHistory, navigateHistory, historyIndex } = useCommandHistory();
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    
    try {
      addToHistory(command);
      const result = await executeCommand(command);
      setOutputs(prevOutputs => [...prevOutputs, {
        command,
        output: result.output,
        isError: result.isError
      }]);
    } catch (error) {
      setOutputs(prevOutputs => [...prevOutputs, {
        command,
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true
      }]);
    }
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