// ゲーム共通の型定義

export interface GameScore {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  playTime: number; // 秒
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  lives: number;
  currentQuestionIndex: number;
  correctAnswers: number;
  totalAnswered: number;
  startTime: number;
  gameSpeed: number;
}

export interface ChimokuRunState extends GameState {
  playerPosition: number; // 0-1 (left-right position)
  walls: Wall[]; // 迫ってくる壁の配列
  showFeedback: boolean;
  feedbackMessage: string;
  remainingQuestions: number; // 残り問題数
  currentPhase: 'chimoku' | 'takuchi-vs-zasshuchi'; // 現在のフェーズ
  backgroundOffset: number; // 背景スクロールオフセット
  animationFrame: number; // アニメーションフレーム番号
  dragStartX: number; // ドラッグ開始位置
  isDragging: boolean; // ドラッグ中かどうか
}

export interface Wall {
  id: string;
  zPosition: number; // 奥行き位置 (0=手前, 1=奥)
  leftChoice: string; // 左側の選択肢
  rightChoice: string; // 右側の選択肢
  correctSide: 'left' | 'right'; // 正解の側
  question: string; // 問題文
  explanation: string; // 解説
  passed: boolean; // 通過済みかどうか
  difficulty: 'easy' | 'medium' | 'hard';
}