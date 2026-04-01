# MiniMax

Collaborative modular synth / audio graph editor.

## Setup

Requires [mise](https://mise.jdx.dev/) for toolchain management.

```sh
mise install        # installs Bun
bun install         # installs dependencies
```

## Development

```sh
bun run dev         # start Vite dev server
bun run build       # typecheck + production build
bun run preview     # preview production build
```

## Code quality

```sh
bun run lint        # ESLint
bun run typecheck   # TypeScript type checking
bun run format      # Prettier (auto-fix)
```

Pre-commit hooks (via Husky + lint-staged) run ESLint and Prettier on staged
`.ts`/`.tsx` files automatically.

## CI

GitHub Actions runs lint, typecheck, and build on every push/PR to `main`.

## Project structure

```
src/
├── audio/       # Audio engine and WebAudio worklets
├── graph/       # Patch graph data model
├── nodes/       # Node definitions and registry
├── scheduler/   # Scheduler and ticker
└── ui/          # React components and React Flow canvas
```

## Transport / context time setup

- Scheduler: Keeps track of when the transport was started in context time, and
  adds this to the transport time
  - AudioGraph (Representation of what's been built). The AudioGraph operates
    in **transport time**
  - Engine (Wrapper round AudioContext for scheduling events) The Engine
    operates in **context time**

## Architecture Plan: 2026-03-24

In plain Web Audio, the browser owns the process loop: you do not call proces
yourself. You only get an explicit `process()` when you use an
`AudioWorkletProcessor`

- PatchModel - description of the "Patch" : event/audio/param types : a graph
  - When the Patch is changed (starting from 0) we update the audio runtime
- Scheduler - Traverse the patch graph for new events, that produce timed
  runtime commands.
- Audio Runtime: takes user input (via the patch model and scheduler)
  - Patch change API
  - Event scheduling API
  - The Runtime needs to maintain some kind of mapping between it's API and
    it's calls to the web audio API.
  - **note/voice** outputs to stable output BUS/NODE -- this is what enables
    the patch graph to map to the web audio graph in a sane way!!!-

Example workflow:

- create runtime object

- keep a mapping to underlying Web Audio objects

- connect looks up those objects and wires them togethe

- Can think of this something like React:

  - patch model: react element tree
  - compiled model: virtual description of what should exist
  - audio runtime applying changes: DOM reconciliation / update

## Architecture plan

Let's sketch out the types we need for the system:

Node types we need:

- Metro

  - Inuts: None
  - Outputs: **events**
  - Controls: BPM (number), Maybe Phase (number)

- Note

  - Inputs: **events**, optionally frequency (from LFO) The oprtional frequency
    will be an inlet
  - Outputs: **audio**
  - Controls: Frequency, duration, volume The UI controlled frequency will be a
    slider

- Oscillator / LFO

  - Inputs: **none**
  - Controls: offset, frequency
  - Outputs: **audio / time-series values**

- Filter

  - Inputs: **audio**
  - Controls: Cutoff frequency
  - Outputs: **audio**

- Output node: (single, pre-created node that you can't delete)

  - Inputs: **audio**
  - Outputs: **none**
  - Controls: overall gain

### Mental model : Runtime API

A `PatchNode` is an internal runtime object roughly corresponding to a UI
object but not necessarily. It's a thing with exposed parameters, inlets and
outlets. The UI receives a identifier `RuntimeNodeHandle` when it calls
`createNode()`. This is used to delete the node. This provides the UI with a
way of performing operations on the audio graph.

We want to perform three events for our minimal implementation of a Runtime

1. `connectSignal()`: In the ui, when we make a connection this means we query
   the two UI graph objects for which `webAudioPort` the nodes we are
   connecting represent. If their types are valid, we will submit the
   connection request to the runtime (which can also fail, in which case 
   we will tell the user that there was an internal error). Therefore, the
   signature of is `connectSignal(nodeId+portName, nodeId+portName) -> boolean`
2. `scheduleNoteEvent()`: This plays an event on noteNode and outputs it on the
   noteNode's output buffer. The signature is therefore 
   `scheduleNoteEvent(nodeId, nodeEvent) -> bool` because it could be on
   a non-existing node.
3. `setParamImmediate()`: This is for the UI to immediately set params 
   probably relying on the Web Audio API's builtin smoothing. We just need
   a `nodeId` and a parameter name. We'll fail if it's not true.
4. `disconnectSignal` uses the same interface as `connectsignal`



The WebAudioRuntime abstraction allows the client not to think about WebAudio
internals and interact with an abstracted version of it. I think this is
probably necessary for sanity and not over-enginering, but that's just
intuition, I don't have a great justification for it. I don't really want
the UI graph to manage web audio objects itself, I think things would get messy

### Mental model: Runtime Internals

A `RuntimeNode` has a set of Named ports, which can be inlets, outlets or
parameters. A connection must be outlet->inlet or outlet->parameter for now. 
Other types of conenctions like linking togehter inlets and outlets makes
sense. It also makes sense to 

Top level structure:
- `private runtimeNodes: Map<RuntimeNodeHandle, RuntimeNode>`: this allows
    lookup for nodes. A RuntimeNode has a list of Ports

### Mental model: how to handle generic structure
1. **Continuous flow**: The graph creates connections, and web audio runs 
   continuously by itself
2. **Discrete events**: A scheduler or producer decides that an event
   happens, which calls a generic interface on a node which will
   have a node-specific implementation

"How things happen":
1. Generic graph builds topology
2. Continuous audio happens because Web Audio Nodes / worklets are live
3. **Discrete bahaviour because a schedule or input source invokes a node**

e.g. an example
```text
source nodes call  `Runtime.emitFrom()`, which calls `dispatchEvent()` on 
its connections, which calls `node.onEvent()` on the connected nodes
```

