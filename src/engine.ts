import type {
  Runtime,
  PatchGraphNodeHandle,
  PatchGraphPortId,
  AnyEvent,
  ScheduledSourceNode,
  ScheduleWindow,
} from './types';

import type { PatchGraphNode } from './types';
import type { PatchNodeData } from './patchGraphNodes/patchGraphNodes';

import { err, ok, type Result } from 'neverthrow';
import { MetroPatchGraphNode } from './patchGraphNodes/metro';
import { NotePatchGraphNode } from './patchGraphNodes/note';
import { OutputPatchGraphNode } from './patchGraphNodes/output';
import { LfoPatchGraphNode } from './patchGraphNodes/lfo';
import { FilterPatchGraphNode } from './patchGraphNodes/filter';

export class WebAudioRuntime implements Runtime {
  private nodes: Map<PatchGraphNodeHandle, PatchGraphNode>;
  private scheduledSources: Map<PatchGraphNodeHandle, ScheduledSourceNode>;
  private audioConnections: { from: PatchGraphPortId; to: PatchGraphPortId }[];
  private eventConnections: { from: PatchGraphPortId; to: PatchGraphPortId }[];
  private lastId: number = -1;

  constructor(private context: AudioContext) {
    this.nodes = new Map();
    this.scheduledSources = new Map();
    this.audioConnections = [];
    this.eventConnections = [];
  }

  async resume(): Promise<void> {
    await this.context.resume();
  }

  currentTime(): number {
    return this.context.currentTime;
  }

  now(): number {
    return this.currentTime();
  }

  createNode(data: PatchNodeData) {
    this.lastId += 1;
    const handle = `${data.type}-${this.lastId}`;
    let node: PatchGraphNode;
    switch (data.type) {
      case 'metro': {
        const metro = new MetroPatchGraphNode(data.data);
        node = metro;
        this.scheduledSources.set(handle, metro);
        break;
      }
      case 'note':
        node = new NotePatchGraphNode(this.context, data.data);
        break;
      case 'output':
        node = new OutputPatchGraphNode(this.context);
        break;
      case 'filter':
        node = new FilterPatchGraphNode(this.context, data.data);
        break;
      case 'lfo':
        node = new LfoPatchGraphNode(this.context, data.data);
        break;
    }
    this.nodes.set(handle, node);
    return ok(handle);
  }

  // Connect outlet -> inlet
  connect(
    outlet: PatchGraphPortId,
    inlet: PatchGraphPortId,
  ): Result<void, string> {
    if (
      !this.nodes.has(inlet.nodeHandle) ||
      !this.nodes.get(inlet.nodeHandle)?.ports.has(inlet.portName) ||
      !this.nodes.has(outlet.nodeHandle) ||
      !this.nodes.get(outlet.nodeHandle)?.ports.has(outlet.portName)
    ) {
      return err('Port does not exist');
    }
    const outPort = this.nodes
      .get(outlet.nodeHandle)!
      .ports.get(outlet.portName)!;
    const inPort = this.nodes.get(inlet.nodeHandle)!.ports.get(inlet.portName)!;

    switch (outPort.type) {
      case 'audio-outlet':
        {
          switch (inPort.type) {
            case 'audio-inlet':
              {
                outPort.node.connect(
                  inPort.node,
                  outPort.outletIndex,
                  inPort.inletIndex,
                );
                this.audioConnections.push({ from: outlet, to: inlet });
              }
              break;
            case 'audio-param':
              {
                outPort.node.connect(inPort.param, outPort.outletIndex);
                this.audioConnections.push({ from: outlet, to: inlet });
              }
              break;
            default:
              return err('Invalid combination of port types');
          }
        }
        break;
      case 'event-outlet':
        {
          switch (inPort.type) {
            case 'event-inlet':
              {
                if (outPort.event != inPort.event) {
                  return err('Invalid combination of event port types');
                }
                this.eventConnections.push({ from: outlet, to: inlet });
              }
              break;
            default:
              return err('Invalid combination of port types');
          }
        }
        break;
      default:
        return err('Invalid combination of port types');
    }
    return ok();
  }

  disconnect(
    _outlet: PatchGraphPortId,
    _inlet: PatchGraphPortId,
  ): Result<void, string> {
    // TODO: Find connection and remove
    return err('');
  }

  deleteNode(_handle: PatchGraphNodeHandle): Result<void, string> {
    // TODO: Delete node and all connections
    return err('');
  }

  schedule(
    window: ScheduleWindow,
    transportStartTime: number,
  ): Result<void, string> {
    let allEvents: { event: AnyEvent; port: PatchGraphPortId }[] = [];
    for (const [handle, node] of this.scheduledSources.entries()) {
      const events = node.schedule(window);
      allEvents = allEvents.concat(
        events.map((event) => {
          event.event.time += transportStartTime;
          return {
            event: event.event,
            port: {
              nodeHandle: handle,
              portName: event.outlet,
            },
          };
        }),
      );
    }
    for (const event of allEvents) {
      this.emit(event.event, event.port);
    }
    return ok();
  }

  private emit(event: AnyEvent, port: PatchGraphPortId) {
    for (const { from, to } of this.eventConnections) {
      if (
        from.portName == port.portName &&
        from.nodeHandle == port.nodeHandle
      ) {
        const node = this.nodes.get(to.nodeHandle);
        node?.onEvent?.(to.portName, event, this.context);
      }
    }
  }

  reset(time: number): void {
    for (const node of this.scheduledSources.values()) {
      node.reset(time);
    }
  }

  setParamImmediate(
    _handle: PatchGraphNodeHandle,
    _param: string,
  ): Result<void, string> {
    // TODO: Look up node and parameter and set it directly
    return err('');
  }
}
