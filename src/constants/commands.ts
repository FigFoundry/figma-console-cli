import { Command } from '../types/commands';
import { LintScope, LintRuleType, LintOptions, LintResult, LintStats } from '../types/lint';

// Help command
const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands',
  execute: async () => {
    const commands = [
      { command: 'ls', description: ': List fonts, styles, components' },
      { command: 'shape', description: ': Create shapes' },
      { command: 'selection', description: ': Show selected elements info' },
      { command: 'analytics', description: ': Display file analytics' },
      { command: 'whoami', description: ': Display current user info' },
      { command: 'clear', description: ': Clear the console' },
      { command: 'exit', description: ': Close the plugin' }
    ];

    // Find the longest command for alignment
    const maxLength = Math.max(...commands.map(c => c.command.length));
    
    const formattedHelp = commands.map(c => {
      const padding = ' '.repeat(maxLength - c.command.length + 2);
      return `${c.command}${padding}${c.description}`;
    }).join('\n');

    return {
      command: 'help',
      output: `\n\n${formattedHelp}\n`,
      isError: false
    };
  }
};

// Clear command
const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the console',
  execute: async () => ({
    command: 'clear',
    output: '',
    isError: false
  })
};

// History command
const historyCommand: Command = {
  name: 'history',
  description: 'List the commands in this terminal\'s history file',
  execute: async () => {
    // Placeholder
    return {
      command: 'history',
      output: 'Command history functionality is provided via up/down arrow keys',
      isError: false
    };
  }
};

// Selection command
const selectionCommand: Command = {
  name: 'selection',
  description: 'Display information about selected elements (use --verbose for detailed info)',
  execute: async (args) => {
    const verbose = args.includes('--verbose');
    
    return new Promise(resolve => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'get-selection',
          verbose 
        } 
      }, '*');
      
      const messageHandler = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        if (message && message.type === 'selection-data') {
          window.removeEventListener('message', messageHandler);
          
          if (message.data.length === 0) {
            resolve({
              command: 'selection',
              output: 'No elements selected',
              isError: false
            });
          } else {
            const output = message.data.map((node: any) => {
              if (verbose) {
                return formatVerboseOutput(node);
              }
              return `${node.id} | ${node.name} | ${node.type}`;
            }).join('\n');
            
            resolve({
              command: 'selection',
              output: verbose ? output : `ID | Name | Type\n${output}`,
              isError: false
            });
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
    });
  }
};

function formatVerboseOutput(node: any): string {
  const baseInfo = [
    `ID: ${node.id}`,
    `Name: ${node.name}`,
    `Type: ${node.type}`,
    `Visible: ${node.visible ? 'Yes' : 'No'}`,
    `Locked: ${node.locked ? 'Yes' : 'No'}`,
    `Position: (${node.x}, ${node.y})`,
    `Dimensions: ${node.width}x${node.height}`,
    `Rotation: ${node.rotation}°`,
    `Opacity: ${Math.round((node.opacity || 1) * 100)}%`
  ];

  const typeSpecificInfo = getTypeSpecificInfo(node);
  const parentInfo = node.parent ? `Parent: ${node.parent.name} (${node.parent.type})` : 'Parent: None';
  
  return [
    ...baseInfo,
    ...typeSpecificInfo,
    parentInfo
  ].join('\n');
}

function getTypeSpecificInfo(node: any): string[] {
  const info: string[] = [];
  
  // Frame/Group specific
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    info.push(`Children: ${node.children ? node.children.length : 0}`);
    if (node.type === 'FRAME') {
      info.push(`Auto Layout: ${node.layoutMode !== 'NONE' ? 'Yes' : 'No'}`);
      info.push(`Constraints: ${JSON.stringify(node.constraints || {})}`);
    }
  }

  // Text specific
  if (node.type === 'TEXT') {
    info.push(`Font: ${node.fontName ? node.fontName.family : 'Unknown'} ${node.fontName ? node.fontName.style : ''}`);
    info.push(`Font Size: ${node.fontSize || 0}px`);
    info.push(`Text: ${node.characters || ''}`);
  }

  // Shape specific
  if (['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR'].includes(node.type)) {
    info.push(`Fills: ${node.fills ? node.fills.length : 0}`);
    info.push(`Strokes: ${node.strokes ? node.strokes.length : 0}`);
    if (node.type === 'RECTANGLE') {
      info.push(`Corner Radius: ${node.cornerRadius || 0}px`);
    }
    if (node.type === 'POLYGON' || node.type === 'STAR') {
      info.push(`Points: ${node.pointCount || 0}`);
    }
    if (node.type === 'STAR') {
      info.push(`Inner Radius: ${node.innerRadius || 0}`);
    }
  }

  // Component specific
  if (node.type === 'INSTANCE') {
    info.push(`Main Component: ${node.mainComponent ? node.mainComponent.name : 'None'}`);
    info.push(`Variant Properties: ${JSON.stringify(node.variantProperties || {})}`);
  }

  return info;
}

// Exit command
const exitCommand: Command = {
  name: 'exit',
  description: 'Closes the terminal plugin',
  execute: async () => {
    parent.postMessage({ pluginMessage: { type: 'close-plugin' } }, '*');
    return {
      command: 'exit',
      output: 'Closing plugin...',
      isError: false
    };
  }
};

const shapeCommand: Command = {
  name: 'shape',
  description: 'Create shapes: shape <type> [...params]',
  execute: async (args) => {
    if (args.length === 0) {
      return {
        command: 'shape',
        output: 'Available shapes:\n' +
          'rect <width> <height> [x] [y]\n' +        
          'circle <diameter> [x] [y]\n' +
          'ellipse <width> <height> [x] [y]\n' +
          'polygon <sides> <radius> [x] [y]\n' +
          'star <points> <outer-radius> <inner-radius> [x] [y]',
        isError: false
      };
    }

    const shapeType = args[0].toLowerCase();
    const validTypes = ['rect', 'circle', 'ellipse', 'polygon', 'star'];
    
    if (!validTypes.includes(shapeType)) {
      return {
        command: 'shape',
        output: `Error: Invalid shape type "${shapeType}".\n Available types: ${validTypes.join(', ')}`,
        isError: true
      };
    }

    try {
      const params = args.slice(1).map(arg => {
        const num = parseFloat(arg);
        if (isNaN(num)) throw new Error(`Invalid number: ${arg}`);
        return num;
      });

      switch (shapeType) {
        case 'rect':
        case 'ellipse': {
          if (params.length < 2) {
            return {
              command: 'shape',
              output: `Error: ${shapeType} requires at least width and height. Usage: shape ${shapeType} <width> <height> [x] [y]`,
              isError: true
            };
          }

          const [width, height, x = 0, y = 0] = params;
          if (width <= 0 || height <= 0) {
            return {
              command: 'shape',
              output: 'Error: Width and height must be greater than 0',
              isError: true
            };
          }

          parent.postMessage({
            pluginMessage: {
              type: 'create-shape',
              shapeType,
              width,
              height,
              x,
              y
            }
          }, '*');

          return {
            command: `shape ${args.join(' ')}`,
            output: `${shapeType} created: ${width}x${height} at (${x}, ${y})`,
            isError: false
          };
        }

        case 'circle': {
          if (params.length < 1) {
            return {
              command: 'shape',
              output: 'Error: Circle requires diameter. Usage: shape circle <diameter> [x] [y]',
              isError: true
            };
          }

          const [diameter, x = 0, y = 0] = params;
          if (diameter <= 0) {
            return {
              command: 'shape',
              output: 'Error: Diameter must be greater than 0',
              isError: true
            };
          }

          parent.postMessage({
            pluginMessage: {
              type: 'create-shape',
              shapeType,
              width: diameter,
              height: diameter,
              x,
              y
            }
          }, '*');

          return {
            command: `shape ${args.join(' ')}`,
            output: `Circle created: diameter ${diameter} at (${x}, ${y})`,
            isError: false
          };
        }

        case 'polygon': {
          if (params.length < 2) {
            return {
              command: 'shape',
              output: 'Error: Polygon requires sides and radius. Usage: shape polygon <sides> <radius> [x] [y]',
              isError: true
            };
          }

          const [sides, radius, x = 0, y = 0] = params;
          if (sides < 3 || !Number.isInteger(sides)) {
            return {
              command: 'shape',
              output: 'Error: Sides must be an integer greater than 2',
              isError: true
            };
          }
          if (radius <= 0) {
            return {
              command: 'shape',
              output: 'Error: Radius must be greater than 0',
              isError: true
            };
          }

          parent.postMessage({
            pluginMessage: {
              type: 'create-shape',
              shapeType,
              sides: Math.floor(sides),
              radius,
              x,
              y
            }
          }, '*');

          return {
            command: `shape ${args.join(' ')}`,
            output: `${sides}-sided polygon created: radius ${radius} at (${x}, ${y})`,
            isError: false
          };
        }

        case 'star': {
          if (params.length < 3) {
            return {
              command: 'shape',
              output: 'Error: Star requires points, outer radius, and inner radius ratio. Usage: shape star <points> <radius> <inner-ratio> [x] [y]\ninner-ratio should be between 0 and 1',
              isError: true
            };
          }

          const [points, outerRadius, innerRatio, x = 0, y = 0] = params;
          if (points < 3 || !Number.isInteger(points)) {
            return {
              command: 'shape',
              output: 'Error: Points must be an integer greater than 2',
              isError: true
            };
          }
          if (outerRadius <= 0) {
            return {
              command: 'shape',
              output: 'Error: Radius must be greater than 0',
              isError: true
            };
          }
          if (innerRatio <= 0 || innerRatio >= 1) {
            return {
              command: 'shape',
              output: 'Error: Inner radius ratio must be between 0 and 1',
              isError: true
            };
          }

          parent.postMessage({
            pluginMessage: {
              type: 'create-shape',
              shapeType,
              sides: Math.floor(points),
              radius: outerRadius,
              innerRadius: innerRatio,
              x,
              y
            }
          }, '*');

          return {
            command: `shape ${args.join(' ')}`,
            output: `${points}-pointed star created: radius ${outerRadius}, inner ratio ${innerRatio} at (${x}, ${y})`,
            isError: false
          };
        }
      }
    } catch (error) {
      return {
        command: 'shape',
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      };
    }
  }
};

function getTypeSpecificProperties(node: SceneNode, verbose: boolean): any {
  const properties: any = {};

  if (verbose) {
    // Frame/Group
    if (node.type === 'FRAME' || node.type === 'GROUP') {
      properties.children = node.children ? node.children.length : 0;
      if (node.type === 'FRAME') {
        properties.layoutMode = node.layoutMode;
        properties.constraints = node.constraints;
      }
    }

    // Text
    if (node.type === 'TEXT') {
      properties.fontName = node.fontName;
      properties.fontSize = node.fontSize;
      properties.characters = node.characters;
    }

    // Shapes
    if (['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR'].includes(node.type)) {
      properties.fills = node.fills;
      properties.strokes = node.strokes;
      if (node.type === 'RECTANGLE') {
        properties.cornerRadius = node.cornerRadius;
      }
      if (node.type === 'POLYGON' || node.type === 'STAR') {
        properties.pointCount = node.pointCount;
      }
      if (node.type === 'STAR') {
        properties.innerRadius = node.innerRadius;
      }
    }

    // Components
    if (node.type === 'INSTANCE') {
      properties.mainComponent = node.mainComponent;
      properties.variantProperties = node.variantProperties;
    }
  }

  return properties;
}

// Analytics command
const analyticsCommand: Command = {
  name: 'analytics',
  description: 'Display analytics about the document (total layers, pages)',
  execute: async () => {
    return new Promise(resolve => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'get-analytics'
        } 
      }, '*');

      const messageHandler = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        if (message && message.type === 'analytics-data') {
          window.removeEventListener('message', messageHandler);
          
          resolve({
            command: 'analytics',
            output: `Total Pages: ${message.totalPages}\nTotal Layers: ${message.totalLayersInDocument}\nTotal Layers in Current Page: ${message.totalLayersInCurrentPage}`,
            isError: false
          });
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
};

// Whoami command
const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display information about the current user',
  execute: async () => {
    return new Promise(resolve => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'get-user-info'
        } 
      }, '*');

      const messageHandler = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        if (message && message.type === 'user-info') {
          window.removeEventListener('message', messageHandler);
          
          resolve({
            command: 'whoami',
            output: `User: ${message.user.name}\nEmail: ${message.user.email}`,
            isError: false
          });
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
};

// LS command
const lsCommand: Command = {
  name: 'ls',
  description: 'List resources in the document (fonts, styles, components)',
  execute: async (args) => {
    const subCommand = args[0] || 'help';
    const listCurrent = args.includes('--current');

    return new Promise(resolve => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'get-ls-data',
          subCommand,
          listCurrent
        } 
      }, '*');

      const messageHandler = (event: MessageEvent) => {
        const message = event.data.pluginMessage;
        if (message && message.type === 'ls-data') {
          window.removeEventListener('message', messageHandler);
          
          resolve({
            command: `ls ${subCommand}${listCurrent ? ' --current' : ''}`,
            output: message.data,
            isError: false
          });
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
};

// Commands array
export const commands = [
  helpCommand,
  clearCommand,
  historyCommand,
  selectionCommand,
  shapeCommand,
  exitCommand,
  analyticsCommand,
  whoamiCommand,
  lsCommand
];