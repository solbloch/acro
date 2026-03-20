let audioCtx = null;
const SFX_MUTE_KEY = 'acro_sfx_muted';
let muted = false;

if (typeof window !== 'undefined') {
  muted = window.localStorage.getItem(SFX_MUTE_KEY) === '1';
}

const getAudioContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioCtx = new AudioContextClass();
  }

  return audioCtx;
};

export const unlockSfx = () => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'suspended') {
    return;
  }

  ctx.resume().catch(() => {});
};

const playTone = (frequency, duration, volume, type, when = 0) => {
  if (muted) {
    return;
  }

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') {
    return;
  }

  const start = ctx.currentTime + when;
  const end = start + duration;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(end);
};

export const isSfxMuted = () => muted;

export const setSfxMuted = (nextMuted) => {
  muted = !!nextMuted;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_MUTE_KEY, muted ? '1' : '0');
  }

  return muted;
};

export const toggleSfxMuted = () => setSfxMuted(!muted);

export const playReadySfx = () => {
  playTone(560, 0.08, 0.03, 'square');
};

export const playSendSfx = () => {
  playTone(520, 0.06, 0.03, 'square');
  playTone(780, 0.1, 0.028, 'triangle', 0.06);
};

export const playVoteSfx = () => {
  playTone(420, 0.06, 0.03, 'square');
  playTone(620, 0.08, 0.028, 'square', 0.05);
};

export const playCountdownSfx = () => {
  playTone(880, 0.04, 0.025, 'triangle');
};

export const playPhaseSfx = (phase) => {
  if (phase === 'answer') {
    playTone(500, 0.08, 0.03, 'triangle');
    playTone(660, 0.08, 0.03, 'triangle', 0.08);
    return;
  }

  if (phase === 'vote') {
    playTone(420, 0.08, 0.03, 'sawtooth');
    playTone(560, 0.08, 0.03, 'sawtooth', 0.08);
    return;
  }

  if (phase === 'viewround' || phase === 'end') {
    playTone(700, 0.08, 0.03, 'triangle');
    playTone(880, 0.1, 0.032, 'triangle', 0.08);
  }
};