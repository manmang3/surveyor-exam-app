import { useState, useCallback, useRef } from 'react';
import { ChimokuRunState, Wall } from '@/types/game';

// 状態分割による最適化
interface GameStateManager {
  gameState: ChimokuRunState;
  updateGameState: (updater: (prev: ChimokuRunState) => ChimokuRunState) => void;
  updateWalls: (updater: (walls: Wall[]) => Wall[]) => void;
  updatePlayerPosition: (position: number) => void;
  updateDragging: (isDragging: boolean, turboStartTime?: number) => void;
  resetGame: () => void;
}

// 初期状態のファクトリー関数
const createInitialState = (gameStartTime: number = performance.now()): ChimokuRunState => ({
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  lives: 1,
  currentQuestionIndex: 0,
  correctAnswers: 0,
  totalAnswered: 0,
  startTime: gameStartTime,
  gameSpeed: 1,
  playerPosition: 0.5,
  walls: [],
  showFeedback: false,
  feedbackMessage: '',
  feedbackStartFrame: 0,
  remainingQuestions: 20,
  currentPhase: 'chimoku',
  backgroundOffset: 0,
  animationFrame: 0,
  dragStartX: 0,
  isDragging: false,
  lastFailedQuestion: null,
  gameStartTime,
  elapsedTime: 0,
  turboStartTime: 0,
  currentSpeedMultiplier: 1
});

export const useGameState = (): GameStateManager => {
  const [gameState, setGameState] = useState<ChimokuRunState>(() => createInitialState());
  
  // メモリプール用の参照を保持
  const stateUpdateRef = useRef({
    lastWallsUpdate: 0,
    wallsUpdateThreshold: 16 // 約60FPSで16ms間隔
  });

  // 状態更新の最適化版
  const updateGameState = useCallback((updater: (prev: ChimokuRunState) => ChimokuRunState) => {
    setGameState(prevState => {
      const newState = updater(prevState);
      
      // 参照が同じ場合は更新をスキップ
      if (newState === prevState) {
        return prevState;
      }
      
      return newState;
    });
  }, []);

  // 壁の位置のみを更新（高頻度更新用）
  const updateWalls = useCallback((updater: (walls: Wall[]) => Wall[]) => {
    const now = performance.now();
    
    // フレームレート制限
    if (now - stateUpdateRef.current.lastWallsUpdate < stateUpdateRef.current.wallsUpdateThreshold) {
      return;
    }
    
    setGameState(prev => {
      const newWalls = updater(prev.walls);
      
      // 壁配列が変わっていない場合はスキップ
      if (newWalls === prev.walls) {
        return prev;
      }
      
      stateUpdateRef.current.lastWallsUpdate = now;
      return {
        ...prev,
        walls: newWalls
      };
    });
  }, []);

  // プレイヤー位置のみ更新（軽量化）
  const updatePlayerPosition = useCallback((position: number) => {
    setGameState(prev => {
      // 位置が変わっていない場合はスキップ
      if (Math.abs(prev.playerPosition - position) < 0.001) {
        return prev;
      }
      
      return {
        ...prev,
        playerPosition: position
      };
    });
  }, []);

  // ドラッグ状態のみ更新（軽量化）
  const updateDragging = useCallback((isDragging: boolean, turboStartTime?: number) => {
    setGameState(prev => {
      // 状態が変わっていない場合はスキップ
      if (prev.isDragging === isDragging) {
        return prev;
      }
      
      return {
        ...prev,
        isDragging,
        turboStartTime: turboStartTime || prev.turboStartTime
      };
    });
  }, []);

  // ゲーム状態のリセット
  const resetGame = useCallback(() => {
    const gameStartTime = performance.now();
    setGameState(createInitialState(gameStartTime));
    
    // 参照値もリセット
    stateUpdateRef.current.lastWallsUpdate = gameStartTime;
  }, []);

  return {
    gameState,
    updateGameState,
    updateWalls,
    updatePlayerPosition,
    updateDragging,
    resetGame
  };
};