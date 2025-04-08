export type MessageType = 
  | 'get-selection'
  | 'selection-data'
  | 'create-shape'
  | 'close-plugin'
  | 'get-analytics'
  | 'analytics-data'
  | 'get-user-info'
  | 'user-info'
  | 'get-ls-data'
  | 'ls-data';

export interface ShapeMessage {
  type: 'create-shape';
  shapeType: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'star';
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  radius?: number;
  sides?: number;
  innerRadius?: number; // for star
}

export interface PluginMessage {
  type: MessageType;
  [key: string]: any;
}