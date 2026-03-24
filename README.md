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

Pre-commit hooks (via Husky + lint-staged) run ESLint and Prettier on staged `.ts`/`.tsx` files automatically.

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
- Scheduler: Keeps track of when the transport was started
  in context time, and adds this to the transport time
  - AudioGraph (Representation of what's been built).
    The AudioGraph operates in **transport time**
  - Engine (Wrapper round AudioContext for scheduling events)
    The Engine operates in **context time**


