import { useRef, useCallback, useEffect } from 'react';

interface GameSounds {
  playButtonSound: () => void;
  playCorrectSound: () => void;
  playGameOverSound: () => void;
  playVictorySound: () => void;
  startRunningSound: () => void;
  stopRunningSound: () => void;
  setRunningSpeed: (speedMultiplier: number) => void;
  resumeAudioContext: () => void;
}

// 音声プールクラス
class AudioPool {
  private audioObjects: HTMLAudioElement[] = [];
  private availableAudios: HTMLAudioElement[] = [];
  private src: string;
  private poolSize: number;

  constructor(src: string, poolSize: number = 2) {
    this.src = src;
    this.poolSize = poolSize;
    this.initializePool();
  }

  private initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio(this.src);
      audio.preload = 'auto';
      audio.load();
      this.audioObjects.push(audio);
      this.availableAudios.push(audio);
    }
  }

  play(volume: number = 1.0): boolean {
    if (this.availableAudios.length === 0) {
      // プールが空の場合、既存の音声を停止して再利用
      const audio = this.audioObjects[0];
      this.stopAudio(audio);
    }

    const audio = this.availableAudios.pop() || this.audioObjects[0];
    if (!audio) return false;

    try {
      audio.volume = volume;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            // 再生完了後にプールに戻す
            audio.addEventListener('ended', () => this.returnToPool(audio), { once: true });
          })
          .catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Audio play failed:', error);
            }
            this.returnToPool(audio);
          });
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Audio play error:', error);
      }
      this.returnToPool(audio);
      return false;
    }
  }

  private stopAudio(audio: HTMLAudioElement) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      // 無視
    }
    this.returnToPool(audio);
  }

  private returnToPool(audio: HTMLAudioElement) {
    if (!this.availableAudios.includes(audio)) {
      this.availableAudios.push(audio);
    }
  }

  cleanup() {
    this.audioObjects.forEach(audio => {
      try {
        audio.pause();
        audio.src = '';
      } catch (error) {
        // 無視
      }
    });
    this.audioObjects = [];
    this.availableAudios = [];
  }
}

// 走る音専用クラス
class RunningAudio {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private targetPlaybackRate = 1.0;
  private currentPlaybackRate = 1.0;
  private lastRateUpdate = 0;
  private rateUpdateInterval = 250; // 250ms間隔に変更

  constructor(src: string) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = 0.6;
    this.audio.preload = 'auto';
    this.audio.load();
  }

  async start(): Promise<boolean> {
    if (!this.audio || this.isPlaying) return false;

    try {
      this.audio.currentTime = 0;
      const playPromise = this.audio.play();
      if (playPromise) {
        await playPromise;
      }
      this.isPlaying = true;
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Running audio start failed:', error);
      }
      return false;
    }
  }

  stop() {
    if (!this.audio || !this.isPlaying) return;

    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.currentPlaybackRate = 1.0;
      this.targetPlaybackRate = 1.0;
    } catch (error) {
      // 無視
    }
  }

  setSpeed(speedMultiplier: number) {
    if (!this.audio || !this.isPlaying) return;

    const now = performance.now();
    this.targetPlaybackRate = Math.min(Math.max(1.0, speedMultiplier * 0.7), 2.0);

    // 250ms間隔で段階的に調整
    if (now - this.lastRateUpdate > this.rateUpdateInterval) {
      const rateDiff = this.targetPlaybackRate - this.currentPlaybackRate;
      if (Math.abs(rateDiff) > 0.05) {
        // 段階的に調整（急激な変化を避ける）
        const step = rateDiff * 0.3;
        this.currentPlaybackRate += step;
        
        try {
          this.audio.playbackRate = this.currentPlaybackRate;
          this.lastRateUpdate = now;
        } catch (error) {
          // playbackRate設定に失敗した場合は無視
          if (process.env.NODE_ENV === 'development') {
            console.warn('PlaybackRate adjustment failed:', error);
          }
        }
      }
    }
  }

  cleanup() {
    this.stop();
    if (this.audio) {
      this.audio.src = '';
      this.audio = null;
    }
  }
}

export const useGameSounds = (): GameSounds => {
  const audioPoolsRef = useRef<{
    button: AudioPool | null;
    correct: AudioPool | null;
    gameover: AudioPool | null;
    victory: AudioPool | null;
  }>({
    button: null,
    correct: null,
    gameover: null,
    victory: null,
  });

  const runningAudioRef = useRef<RunningAudio | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  // AudioContext の管理
  const initializeAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // AudioContextを作成（既に存在する場合は再利用）
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioContext initialization failed:', error);
      }
    }
  }, []);

  // AudioContextの復旧
  const resumeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        if (process.env.NODE_ENV === 'development') {
          console.log('AudioContext resumed');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioContext resume failed:', error);
      }
    }
  }, []);

  // 音声システムの初期化
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    initializeAudioContext();

    // 音声プールの初期化
    audioPoolsRef.current.button = new AudioPool('/sounds/button.mp3', 2);
    audioPoolsRef.current.correct = new AudioPool('/sounds/correct.mp3', 3);
    audioPoolsRef.current.gameover = new AudioPool('/sounds/gameover.mp3', 2);
    audioPoolsRef.current.victory = new AudioPool('/sounds/victory.mp3', 2);

    // 走る音の初期化
    runningAudioRef.current = new RunningAudio('/sounds/running.mp3');

    isInitializedRef.current = true;

    // クリーンアップ
    return () => {
      Object.values(audioPoolsRef.current).forEach(pool => {
        if (pool) pool.cleanup();
      });
      
      if (runningAudioRef.current) {
        runningAudioRef.current.cleanup();
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          // 無視
        }
      }
      
      isInitializedRef.current = false;
    };
  }, [initializeAudioContext]);

  const playButtonSound = useCallback(async () => {
    await resumeAudioContext();
    audioPoolsRef.current.button?.play(0.7);
  }, [resumeAudioContext]);

  const playCorrectSound = useCallback(async () => {
    await resumeAudioContext();
    audioPoolsRef.current.correct?.play(0.8);
  }, [resumeAudioContext]);

  const playGameOverSound = useCallback(async () => {
    await resumeAudioContext();
    audioPoolsRef.current.gameover?.play(0.9);
  }, [resumeAudioContext]);

  const playVictorySound = useCallback(async () => {
    await resumeAudioContext();
    audioPoolsRef.current.victory?.play(0.9);
  }, [resumeAudioContext]);

  const startRunningSound = useCallback(async () => {
    await resumeAudioContext();
    if (runningAudioRef.current) {
      await runningAudioRef.current.start();
    }
  }, [resumeAudioContext]);

  const stopRunningSound = useCallback(() => {
    if (runningAudioRef.current) {
      runningAudioRef.current.stop();
    }
  }, []);

  const setRunningSpeed = useCallback((speedMultiplier: number) => {
    if (runningAudioRef.current) {
      runningAudioRef.current.setSpeed(speedMultiplier);
    }
  }, []);

  return {
    playButtonSound,
    playCorrectSound,
    playGameOverSound,
    playVictorySound,
    startRunningSound,
    stopRunningSound,
    setRunningSpeed,
    resumeAudioContext,
  };
};