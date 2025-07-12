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
  initializeMobileAudio: () => Promise<void>;
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
    } catch {
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
      } catch {
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
    } catch {
      // 無視
    }
  }

  setSpeed(speedMultiplier: number) {
    if (!this.audio || !this.isPlaying) return;

    // モバイル安定性のため、段階的な固定値に簡素化
    let targetRate = 1.0;
    if (speedMultiplier >= 3.0) {
      targetRate = 1.8; // 最高速度
    } else if (speedMultiplier >= 2.0) {
      targetRate = 1.4; // 中速度
    } else if (speedMultiplier >= 1.5) {
      targetRate = 1.2; // 低速度
    }

    // 更新間隔を500msに延長してCPU負荷軽減
    const now = performance.now();
    if (now - this.lastRateUpdate > 500 && Math.abs(this.currentPlaybackRate - targetRate) > 0.1) {
      try {
        this.audio.playbackRate = targetRate;
        this.currentPlaybackRate = targetRate;
        this.lastRateUpdate = now;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`足音速度変更: ${speedMultiplier.toFixed(1)}x → ${targetRate.toFixed(1)}x`);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PlaybackRate adjustment failed:', error);
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
  const lastSoundTimesRef = useRef({
    correct: 0,
    gameover: 0,
    victory: 0
  });

  // AudioContext の管理
  const initializeAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // AudioContextを作成（既に存在する場合は再利用）
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

  // モバイル音声初期化の強化
  const initializeMobileAudio = useCallback(async () => {
    // モバイル向け音声初期化：完全無音で実際の音声ファイルを再生
    try {
      await resumeAudioContext();
      
      // 実際のボタン音を完全無音で再生してiOS/Android音声コンテキストを初期化
      if (audioPoolsRef.current.button) {
        audioPoolsRef.current.button.play(0); // 完全無音で初期化
      }
      
      // 短い遅延後に正解音も初期化
      setTimeout(() => {
        if (audioPoolsRef.current.correct) {
          audioPoolsRef.current.correct.play(0); // 完全無音で初期化
        }
      }, 50);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Mobile audio initialized silently with real audio files');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Mobile audio initialization failed:', error);
      }
    }
  }, [resumeAudioContext]);

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
      const currentAudioPools = audioPoolsRef.current;
      Object.values(currentAudioPools).forEach(pool => {
        if (pool) pool.cleanup();
      });
      
      if (runningAudioRef.current) {
        runningAudioRef.current.cleanup();
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {
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
    // モバイルでの音声再生信頼性向上のため、再生前に短い遅延を追加
    await resumeAudioContext();
    
    // 音声再生の重複を防ぐため、短時間での連続再生をスキップ
    const now = performance.now();
    if (now - lastSoundTimesRef.current.correct < 200) { // 200ms以内の連続再生を防止
      return;
    }
    lastSoundTimesRef.current.correct = now;
    
    // プール枯渇時のフォールバック処理
    const success = audioPoolsRef.current.correct?.play(0.8);
    if (!success && process.env.NODE_ENV === 'development') {
      console.warn('正解音再生失敗: プール枯渇またはユーザーインタラクション不足');
    }
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
    initializeMobileAudio,
  };
};