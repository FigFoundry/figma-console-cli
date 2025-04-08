import React from 'react';
import { CommandResult } from './types/commands';
import '../../styles/components/commandOutput.scss';

interface CommandOutputProps {
  outputs: CommandResult[];
}

const CommandOutput: React.FC<CommandOutputProps> = ({ outputs }) => {
  return (
    <div className="command-output">
      {outputs.map((result, index) => (
        <div key={index} className="command-output__item">
          {result.command && (
            <div className="command-output__command">
              <span className="command-output__prompt">%</span> {result.command}
            </div>
          )}
          <div className={`command-output__result ${result.isError ? 'command-output__result--error' : ''}`}>
            {result.output.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="command-output__line">{line}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommandOutput;