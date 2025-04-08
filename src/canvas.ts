// canvas.ts

// Type definitions for messages
type BaseMessage = {
  type: string;
}

type GetSelectionMessage = BaseMessage & {
  type: 'get-selection';
  verbose?: boolean;
}

type CreateShapeMessage = BaseMessage & {
  type: 'create-shape';
  shapeType: 'rect' | 'ellipse' | 'circle' | 'polygon' | 'star';
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  radius?: number;
  sides?: number;
  innerRadius?: number;
}

type GetLsDataMessage = BaseMessage & {
  type: 'get-ls-data';
  subCommand?: 'fonts' | 'styles' | 'components' | 'help';
  listCurrent?: boolean;
}

type PluginMessage = 
  | GetSelectionMessage
  | CreateShapeMessage
  | GetLsDataMessage
  | { type: 'close-plugin' }
  | { type: 'get-analytics' }
  | { type: 'get-user-info' };

// Initialize UI
figma.showUI(__html__, { themeColors: true, width: 400, height: 512 });

/**
 * Standardized error handling function - only sends error messages to UI, no figma.notify
 */
function handleError(context: string, error: Error): void {
  const errorMessage = `Error ${context}: ${error.message}`;
  figma.ui.postMessage({ 
    type: 'error', 
    context,
    message: errorMessage
  });
}

// Handle messages from the UI
figma.ui.onmessage = (msg) => {
  // Parse the message if it's a string
  const message = typeof msg === 'string' ? JSON.parse(msg) : msg as PluginMessage;

  switch (message.type) {
    case 'get-selection':
      handleGetSelection(message);
      break;
    
    case 'create-shape':
      handleCreateShape(message);
      break;
    
    case 'close-plugin':
      figma.closePlugin();
      break;
    
    case 'get-analytics':
      handleGetAnalytics();
      break;
    
    case 'get-user-info':
      handleGetUserInfo();
      break;
    
    case 'get-ls-data':
      handleGetLsData(message);
      break;
    
    default:
      handleError('processing message', new Error(`Unsupported message type: ${(message as any).type}`));
  }
};

/**
 * Handle get-selection message
 */
function handleGetSelection(message: GetSelectionMessage): void {
  try {
    const nodes = figma.currentPage.selection;
    
    // Handle empty selection
    if (nodes.length === 0) {
      figma.ui.postMessage({ 
        type: 'selection-data', 
        data: [],
        message: 'No nodes selected'
      });
      return;
    }
    
    const verbose = message.verbose || false;
    
    const data = nodes.map(node => {
      const baseProperties = {
        id: node.id,
        name: node.name,
        type: node.type,
        visible: node.visible,
        locked: node.locked,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        rotation: node.rotation,
        opacity: node.opacity,
        parent: node.parent ? { 
          id: node.parent.id, 
          name: node.parent.name, 
          type: node.parent.type 
        } : null
      };

      return baseProperties;
    });

    figma.ui.postMessage({ 
      type: 'selection-data', 
      data: data
    });
  } catch (error) {
    handleError('getting selection', error);
  }
}

/**
 * Handle create-shape message
 */
function handleCreateShape(message: CreateShapeMessage): void {
  try {
    // Validate dimensions
    const width = message.width || 100;
    const height = message.height || 100;
    const radius = message.radius || 50;
    
    if (width <= 0 || height <= 0 || radius <= 0) {
      throw new Error('Shape dimensions must be positive values');
    }
    
    let node: SceneNode;
    
    switch (message.shapeType) {
      case 'rect': {
        node = figma.createRectangle();
        node.resize(width, height);
        break;
      }
      
      case 'ellipse': {
        node = figma.createEllipse();
        node.resize(width, height);
        break;
      }
      
      case 'circle': {
        node = figma.createEllipse();
        node.resize(width, width); // Use width as diameter
        break;
      }
      
      case 'polygon': {
        node = figma.createPolygon();
        const sides = message.sides || 6;
        if (sides < 3) {
          throw new Error('Polygons require at least 3 sides');
        }
        node.pointCount = sides;
        node.resize(radius * 2, radius * 2);
        break;
      }
      
      case 'star': {
        node = figma.createStar();
        const sides = message.sides || 5;
        if (sides < 3) {
          throw new Error('Stars require at least 3 points');
        }
        node.pointCount = sides;
        const innerRadius = message.innerRadius || radius * 0.4;
        if (innerRadius <= 0 || innerRadius >= radius) {
          throw new Error('Inner radius must be positive and less than outer radius');
        }
        node.innerRadius = innerRadius;
        node.resize(radius * 2, radius * 2);
        break;
      }
      
      default:
        throw new Error(`Unsupported shape type: ${message.shapeType}`);
    }

    // Common properties
    node.x = message.x || 0;
    node.y = message.y || 0;
    figma.currentPage.appendChild(node);
    
    // Select the new shape
    figma.currentPage.selection = [node];
    
    // Center viewport on the new shape
    figma.viewport.scrollAndZoomIntoView([node]);
    
    // Success message to UI only
    figma.ui.postMessage({
      type: 'shape-created',
      shapeType: message.shapeType,
      id: node.id
    });
  } catch (error) {
    handleError('creating shape', error);
  }
}

/**
 * Handle get-analytics message with timeout for large documents
 */
function handleGetAnalytics(): void {
  // Set a timeout to prevent hanging on very large documents
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Analytics timeout: Document may be too large')), 10000);
  });

  Promise.race([figma.loadAllPagesAsync(), timeoutPromise])
    .then(() => {
      try {
        // Exclude separators from page count
        const totalPages = figma.root.children.filter(page => page.type !== 'SECTION').length;

        // Count total layers in the entire document
        const totalLayersInDocument = figma.root.children.reduce((acc, page) => {
          if (page.type !== 'SECTION') {
            return acc + page.findAll().length;
          }
          return acc;
        }, 0);

        // Count layers in the current page
        const totalLayersInCurrentPage = figma.currentPage.findAll().length;

        figma.ui.postMessage({ 
          type: 'analytics-data', 
          totalPages,
          totalLayersInDocument,
          totalLayersInCurrentPage
        });
      } catch (error) {
        handleError('getting analytics', error);
      }
    })
    .catch(error => {
      handleError('loading pages', error);
    });
}

/**
 * Handle get-user-info message
 */
function handleGetUserInfo(): void {
  try {
    // Get the current user's information
    const user = figma.currentUser;
    
    // Offline mode
    if (!user) {
      figma.ui.postMessage({ 
        type: 'user-info', 
        user: null,
        message: 'User information not available. You may be working offline.'
      });
      return;
    }

    figma.ui.postMessage({ 
      type: 'user-info', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    handleError('getting user info', error);
  }
}

/**
 * Handle get-ls-data message
 */
function handleGetLsData(message: GetLsDataMessage): void {
  const subCommand = message.subCommand || 'help';
  const listCurrent = message.listCurrent || false;

  const handleLsData = async () => {
    let data = '';

    try {
      switch (subCommand) {
        case 'fonts':
          const fontData = await handleFontsList(listCurrent);
          data = fontData.join('\n') || (listCurrent ? 'No fonts found in current page' : 'No fonts found');
          break;

        case 'styles':
          const styleData = await handleStylesList(listCurrent);
          data = styleData.join('\n') || (listCurrent ? 'No styles found in current page' : 'No styles found');
          break;

        case 'components':
          const componentData = await handleComponentsList(listCurrent);
          data = componentData.join('\n') || (listCurrent ? 'No components found in current page' : 'No components found');
          break;

        case 'help':
          data = `Available lists:
fonts       : List fonts
styles      : List styles
components  : List components`;
          break;

        default:
          throw new Error(`Unsupported subcommand: ${subCommand}`);
      }

      figma.ui.postMessage({ 
        type: 'ls-data', 
        data: data,
        subCommand
      });
    } catch (error) {
      handleError(`loading ${subCommand} data`, error);
    }
  };

  handleLsData();
}

/**
 * Helper function to handle fonts list
 */
async function handleFontsList(listCurrent: boolean): Promise<string[]> {
  if (listCurrent) {
    const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];
    // When there are no text nodes
    if (textNodes.length === 0) {
      return [];
    }
    
    const uniqueFonts = new Set<string>();
    for (const node of textNodes) {
      if (node.fontName !== figma.mixed) {
        uniqueFonts.add(`${node.fontName.family} ${node.fontName.style}`);
      } else {
        // Mixed fonts in text node by getting ranges
        const characters = node.characters;
        for (let i = 0; i < characters.length; i++) {
          const fontName = node.getRangeFontName(i, i + 1);
          if (fontName !== figma.mixed) {
            uniqueFonts.add(`${fontName.family} ${fontName.style}`);
          }
        }
      }
    }
    return Array.from(uniqueFonts);
  } else {
    const textStyles = await figma.getLocalTextStylesAsync();
    return textStyles.map(style => `${style.fontName.family} ${style.fontName.style}`);
  }
}

/**
 * Helper function to handle styles list
 */
async function handleStylesList(listCurrent: boolean): Promise<string[]> {
  if (listCurrent) {
    const styleIds = new Set<string>();
    const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];
    
    // When there are no text nodes
    if (textNodes.length === 0) {
      return [];
    }
    
    // Get all style IDs from text nodes
    textNodes.forEach(node => {
      if (node.textStyleId !== figma.mixed && node.textStyleId) {
        styleIds.add(node.textStyleId);
      }
    });
    
    const uniqueStyles = new Set<string>();
    styleIds.forEach(styleId => {
      const style = figma.getStyleById(styleId);
      if (style) {
        uniqueStyles.add(style.name);
      }
    });
    
    return Array.from(uniqueStyles);
  } else {
    const styles = await figma.getLocalTextStylesAsync();
    return styles.map(style => style.name);
  }
}

/**
 * Helper function to handle components list
 */
async function handleComponentsList(listCurrent: boolean): Promise<string[]> {
  if (listCurrent) {
    const components = figma.currentPage.findAll(node => node.type === 'COMPONENT') as ComponentNode[];
    const componentSets = figma.currentPage.findAll(node => node.type === 'COMPONENT_SET') as ComponentSetNode[];
    
    const allNames = [
      ...components.map(component => component.name),
      ...componentSets.map(set => `${set.name} (Set)`)
    ];
    
    return allNames;
  } else {
    // Make sure all pages are loaded
    await figma.loadAllPagesAsync();
    
    const allNames: string[] = [];
    
    // Loop through all pages
    for (const page of figma.root.children) {
      if (page.type !== 'SECTION') {
        try {
          // Find components in this page
          const componentsInPage = page.findAll(node => node.type === 'COMPONENT') as ComponentNode[];
          const componentSetsInPage = page.findAll(node => node.type === 'COMPONENT_SET') as ComponentSetNode[];
          
          // Add component names
          componentsInPage.forEach(component => {
            allNames.push(`${component.name} (in ${page.name})`);
          });
          
          // Add component set names
          componentSetsInPage.forEach(set => {
            allNames.push(`${set.name} (Set, in ${page.name})`);
          });
        } catch (pageError) {
          handleError(`processing page "${page.name}"`, pageError);
        }
      }
    }
    
    return allNames;
  }
}