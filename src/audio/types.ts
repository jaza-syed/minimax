export interface NoteEvent {
  time: number; // Scheduled time for the event for the AudioContext
  frequency: number;
  duration: number;
}

export interface AudioEngine {
  // Start the audio engine
  resume(): Promise<void>;
  // Get the current AudioContext time
  now(): number;
  // Schedule an event
  scheduleNote(event: NoteEvent): void;
}
