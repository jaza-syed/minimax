import { Scheduler } from '@/scheduler/scheduler';
import { AudioGraph } from '@/graph/graph';
import { WebAudioEngine } from '@/audio/engine';

const engine = new WebAudioEngine(new AudioContext());
const graph = new AudioGraph();
const scheduler = new Scheduler(engine, graph);

function handleStart(): void {
  scheduler.start();
}

function handleStop(): void {
  scheduler.stop();
}

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button type="button" onClick={handleStart}>
        Start
      </button>
      <button type="button" onClick={handleStop}>
        Stop
      </button>
    </div>
  );
}
