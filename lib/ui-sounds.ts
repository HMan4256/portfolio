// Short, original chiptune cues. Pitch values are MIDI note numbers.
type Tone = readonly [offset: number, length: number, pitch: number, gain: number, endPitch?: number];
const cues = {
  hover: [[0, 0.045, 79, 0.10, 83]],
  select: [[0, 0.065, 69, 0.20], [0.033, 0.085, 76, 0.16]],
  click: [[0, 0.055, 64, 0.22, 59], [0.028, 0.075, 72, 0.12]],
  ripple: [[0, 0.060, 81, 0.075], [0.028, 0.075, 86, 0.075]],
  pet: [[0, 0.12, 67, 0.18, 74], [0.085, 0.13, 79, 0.15], [0.16, 0.16, 86, 0.11]],
  bump: [[0, 0.09, 50, 0.26, 45], [0.068, 0.095, 53, 0.12, 48]],
  snakeStart: [[0, 0.06, 60, 0.16], [0.052, 0.07, 67, 0.15], [0.11, 0.09, 72, 0.17]],
  snakeTurn: [[0, 0.035, 62, 0.09, 55]],
  snakeEat: [[0, 0.065, 72, 0.20], [0.042, 0.1, 84, 0.19]],
  snakePause: [[0, 0.06, 67, 0.14], [0.05, 0.08, 60, 0.14]],
  snakeCrash: [[0, 0.095, 52, 0.22, 42], [0.095, 0.16, 45, 0.18, 33]],
  snakeWin: [[0, 0.08, 72, 0.18], [0.07, 0.08, 76, 0.18], [0.14, 0.08, 79, 0.18], [0.22, 0.22, 84, 0.20]],
  cover: [[0.05, 0.19, 67, 0.15, 47], [0.10, 0.12, 60, 0.08, 48]],
  reveal: [[0.035, 0.13, 60, 0.15], [0.095, 0.13, 67, 0.14], [0.16, 0.19, 76, 0.12]],
  language: [[0, 0.055, 69, 0.15], [0.045, 0.055, 67, 0.13], [0.09, 0.055, 74, 0.13], [0.18, 0.16, 81, 0.12]],
} as const satisfies Record<string, readonly Tone[]>;

export type SoundCue = keyof typeof cues;

function frequency(pitch: number) {
  return 440 * 2 ** ((pitch - 69) / 12);
}

export function createUiAudio() {
  let context: AudioContext | undefined;
  let output: GainNode | undefined;
  let resume: Promise<void> | undefined;
  let muted = false;
  let revision = 0;
  const playing = new Set<OscillatorNode>();
  const lastPlayed = new Map<SoundCue, number>();

  function unlock() {
    if (muted || typeof AudioContext === "undefined") return;
    if (!context || context.state === "closed") {
      try {
        context = new AudioContext();
      } catch {
        return;
      }
      output = context.createGain();
      output.gain.value = 0.45;
      output.connect(context.destination);
    }
    if (context.state !== "running" && !resume) {
      const audio = context;
      resume = audio.resume().catch(() => {}).finally(() => {
        if (context === audio) resume = undefined;
      });
    }
  }

  function play(cue: SoundCue) {
    const audio = context;
    const destination = output;
    if (muted || !audio || !destination) return;
    const requested = performance.now();
    const version = revision;

    function start(audio: AudioContext, destination: GainNode) {
      if (muted || revision !== version || audio.state !== "running" || performance.now() - requested > 180) return;
      const now = audio.currentTime;
      if (cue === "hover" || cue === "ripple") {
        if (now - (lastPlayed.get(cue) ?? -Infinity) < 0.045) return;
        lastPlayed.set(cue, now);
      }

      const tones: readonly Tone[] = cues[cue];
      for (const [offset, length, pitch, gain, endPitch] of tones) {
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        const begin = now + offset + 0.005;
        const end = begin + length;
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency(pitch), begin);
        if (endPitch !== undefined) oscillator.frequency.exponentialRampToValueAtTime(frequency(endPitch), end);
        envelope.gain.setValueAtTime(0, begin);
        envelope.gain.linearRampToValueAtTime(gain, begin + 0.009);
        envelope.gain.exponentialRampToValueAtTime(0.0001, end);

        oscillator.connect(envelope);
        envelope.connect(destination);
        playing.add(oscillator);
        oscillator.onended = () => {
          playing.delete(oscillator);
          oscillator.disconnect();
          envelope.disconnect();
        };
        oscillator.start(begin);
        oscillator.stop(end);
      }
    }

    if (audio.state === "running") start(audio, destination);
    else void resume?.then(() => start(audio, destination));
  }

  function setMuted(value: boolean) {
    if (muted === value) return;
    muted = value;
    revision++;
    lastPlayed.clear();
    if (output && context) output.gain.setValueAtTime(value ? 0 : 0.45, context.currentTime);
    if (value) {
      for (const oscillator of playing) oscillator.stop();
      playing.clear();
    }
  }

  function close() {
    revision++;
    lastPlayed.clear();
    playing.clear();
    if (context && context.state !== "closed") void context.close().catch(() => {});
    context = undefined;
    output = undefined;
    resume = undefined;
  }

  return { play, unlock, setMuted, close };
}
