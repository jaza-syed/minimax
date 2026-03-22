export type PortType = 'audio' | 'number' | 'boolean' | 'string' | 'trigger';

export type PortValue = number | boolean | string | number[];

export interface PortDefinition {
  name: string;
  type: PortType;
  defaultValue?: PortValue;
}

export interface NodeAttributes {
  type: string;
  position: { x: number; y: number };
  state: Record<string, unknown>;
}

export interface EdgeAttributes {
  sourcePort: string;
  targetPort: string;
}
