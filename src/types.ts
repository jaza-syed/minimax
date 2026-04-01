import { type Result } from 'neverthrow';
import type { PatchNodeData } from './patchGraphNodes/patchGraphNodes';

// Event types
export interface TriggerEvent {
  time: number;
  kind: 'trigger';
}

export interface NoteEvent {
  time: number;
  kind: 'note';
  frequency: number;
  duration: number;
}

export type AnyEvent = NoteEvent | TriggerEvent;

// Patch port types
export type WebAudioPort =
  | { type: 'audio-inlet'; node: AudioNode; inletIndex: number }
  | { type: 'audio-outlet'; node: AudioNode; outletIndex: number }
  | { type: 'audio-param'; param: AudioParam };

export type EventPort =
  | { type: 'event-inlet'; event: 'trigger' | 'note' }
  | { type: 'event-outlet'; event: 'trigger' | 'note' };

export type PatchGraphPort = WebAudioPort | EventPort;

// Node type - for nodes to implement
export interface PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  onEvent?(port: string, event: AnyEvent, context: AudioContext): void;
}

// top-level runtime interface types
export type PatchGraphNodeHandle = string;
export type PatchGraphPortName = string;
export interface PatchGraphPortId {
  nodeHandle: PatchGraphNodeHandle;
  portName: PatchGraphPortName;
}

// Runtime interfaces + wrappers for the scheduler / nodes

export interface ScheduleRuntimeContext {
  // Obtain current absolute time
  now(): number;
  // Window in audio
  schedule(window: ScheduleWindow, transportStartTime: number): void;
  reset(time: number): void;
}

export interface ScheduledSourceNode {
  reset(startTime: number): void;
  schedule(window: ScheduleWindow): {
    outlet: PatchGraphPortName;
    event: AnyEvent;
  }[];
}

export interface ScheduleWindow {
  startTime: number;
  endTime: number;
}

export interface Runtime {
  createNode(data: PatchNodeData): Result<PatchGraphNodeHandle, string>;
  connect(
    outlet: PatchGraphPortId,
    inlet: PatchGraphPortId,
  ): Result<void, string>;
  disconnect(
    inlet: PatchGraphPortId,
    outlet: PatchGraphPortId,
  ): Result<void, string>;
  deleteNode(handle: PatchGraphNodeHandle): Result<void, string>;
  setParamImmediate(
    handle: PatchGraphNodeHandle,
    param: string,
    value: number | string,
  ): Result<void, string>;
  schedule(
    window: ScheduleWindow,
    transportStartTime: number,
  ): Result<void, string>;
  now(): number;
  reset(time: number): void;
}

// Scheduler interface
export interface Scheduler {
  start(): void;
  stop(): void;
}
