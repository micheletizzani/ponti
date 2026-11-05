/**
 * Audio: metronomo visuo-prosodico e registrazione locale.
 * Nessun servizio cloud, nessun ASR: si registra, si mostra l'inviluppo,
 * si conserva il campione per la revisione del logopedista.
 */

export interface RecordingResult {
  blob: Blob;
  durationMs: number;
  peaks: number[];
  ssi: number | null;
}

let audioContext: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

/** Click discreto: acuto sulla sillaba accentata, più grave altrove. */
export function playBeat(stressed: boolean): void {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(stressed ? 660 : 440, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(stressed ? 0.09 : 0.05, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (stressed ? 0.16 : 0.1));
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

/** Conferma neutra: nessun suono di errore, nessun jingle punitivo. */
export function playSoftConfirm(): void {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  gain.connect(ctx.destination);
  [392, 523.25].forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(now + index * 0.08);
    oscillator.stop(now + 0.5);
  });
}

/**
 * Stima grezza dell'Indice di Segregazione Sillabica:
 * pausa più lunga / durata totale attiva. Non è un dato clinico
 * validato, è un indicatore di andamento da rivedere in seduta.
 */
export function estimateSsi(peaks: number[]): number | null {
  if (peaks.length < 8) return null;
  const max = Math.max(...peaks);
  if (max <= 0.01) return null;
  const threshold = Math.max(max * 0.14, 0.012);
  const firstActive = peaks.findIndex((value) => value >= threshold);
  const lastActive = peaks.length - 1 - [...peaks].reverse().findIndex((value) => value >= threshold);
  if (firstActive < 0 || lastActive <= firstActive) return null;

  let longestGap = 0;
  let run = 0;
  for (let index = firstActive; index <= lastActive; index += 1) {
    const value = peaks[index] ?? 0;
    if (value < threshold) {
      run += 1;
      longestGap = Math.max(longestGap, run);
    } else {
      run = 0;
    }
  }
  const span = lastActive - firstActive + 1;
  return Math.min(1, Math.round((longestGap / span) * 100) / 100);
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private peaks: number[] = [];
  private startedAt = 0;
  private sampler: number | null = null;
  private analyser: AnalyserNode | null = null;
  private readable: Uint8Array<ArrayBuffer> | null = null;

  get isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('Registrazione non disponibile su questo dispositivo');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.stream = stream;
    this.chunks = [];
    this.peaks = [];
    this.startedAt = performance.now();

    const ctx = context();
    if (ctx) {
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      this.analyser = analyser;
      this.readable = new Uint8Array(analyser.fftSize);
      this.sampler = window.setInterval(() => this.sample(), 55);
    }

    this.recorder = new MediaRecorder(stream);
    this.recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    });
    this.recorder.start();
  }

  private sample(): void {
    if (!this.analyser || !this.readable) return;
    this.analyser.getByteTimeDomainData(this.readable);
    let sum = 0;
    for (let index = 0; index < this.readable.length; index += 1) {
      const value = ((this.readable[index] ?? 128) - 128) / 128;
      sum += value * value;
    }
    this.peaks.push(Math.min(1, Math.sqrt(sum / this.readable.length) * 3.2));
  }

  async stop(): Promise<RecordingResult> {
    const recorder = this.recorder;
    if (!recorder) throw new Error('Nessuna registrazione in corso');

    const done = new Promise<Blob>((resolve) => {
      recorder.addEventListener('stop', () => resolve(new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' })), {
        once: true,
      });
    });

    recorder.stop();
    this.recorder = null;
    if (this.sampler !== null) {
      window.clearInterval(this.sampler);
      this.sampler = null;
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.analyser = null;

    const blob = await done;
    const durationMs = Math.max(0, Math.round(performance.now() - this.startedAt));
    // Riduciamo l'inviluppo a 64 punti: leggero su IndexedDB, leggibile a schermo.
    const bucket = Math.max(1, Math.ceil(this.peaks.length / 64));
    const reduced: number[] = [];
    for (let index = 0; index < this.peaks.length; index += bucket) {
      const slice = this.peaks.slice(index, index + bucket);
      reduced.push(Math.max(...slice));
    }
    return { blob, durationMs, peaks: reduced.slice(0, 96), ssi: estimateSsi(this.peaks) };
  }

  cancel(): void {
    this.recorder?.stop();
    this.recorder = null;
    if (this.sampler !== null) window.clearInterval(this.sampler);
    this.sampler = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
