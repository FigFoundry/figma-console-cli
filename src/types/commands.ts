export interface CommandResult {
    command: string;
    output: string;
    isError: boolean;
  }
  
  export interface Command {
    name: string;
    description: string;
    execute: (args?: string[]) => Promise<CommandResult>;
  }