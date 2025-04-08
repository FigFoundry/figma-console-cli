import { commands } from '../constants/commands';
import { CommandResult } from '../types/commands';

export const parseCommand = (input: string) => {
  const [command, ...args] = input.split(' ');
  return { command, args };
};

export const executeCommand = async (input: string): Promise<CommandResult> => {
  const { command, args } = parseCommand(input);
  
  if (!command) {
    return {
      command: input,
      output: 'Error: Empty command',
      isError: true
    };
  }

  const commandHandler = commands.find((cmd) => cmd.name === command);
  
  if (!commandHandler) {
    return {
      command: input,
      output: `Error: Command "${command}" not found`,
      isError: true
    };
  }
  
  try {
    return await commandHandler.execute(args);
  } catch (error) {
    return {
      command: input,
      output: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isError: true
    };
  }
};