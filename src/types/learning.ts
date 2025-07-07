// 学習進捗管理の型定義

export interface AnswerRecord {
  answeredAt: string; // ISO 8601 形式の日時
  isCorrect: boolean;
  answerTime: number; // 秒単位
  userAnswer: number; // 選択した回答のインデックス
  sessionType: 'individual' | 'exam'; // 個別問題 or 試験モード
}

export interface QuestionHistory {
  attempts: AnswerRecord[];
}

export interface DailyStats {
  totalProblems: number; // その日に解答した問題数
  correctAnswers: number; // その日の正解数
  totalTime: number; // その日の学習時間（分単位）
}

export interface LearningSettings {
  startDate: string; // 学習開始日（ISO 8601形式）
  lastAccess: string; // 最終アクセス日（ISO 8601形式）
}

export interface LearningData {
  answers: {
    [questionId: string]: QuestionHistory;
  };
  dailyStats: {
    [date: string]: DailyStats; // YYYY-MM-DD形式のキー
  };
  settings: LearningSettings;
}

// 学習統計の計算結果
export interface LearningStatistics {
  totalQuestions: number; // 総解答問題数
  totalCorrect: number; // 総正解数
  overallAccuracy: number; // 全体正答率（0-100）
  totalTime: number; // 累計学習時間（分）
  streakDays: number; // 連続学習日数
  averageTimePerQuestion: number; // 1問あたりの平均時間（秒）
}

// 日別学習統計（拡張版）
export interface DayLearningStats extends DailyStats {
  date: string;
  accuracy: number; // その日の正答率（0-100）
  averageTime: number; // その日の1問あたり平均時間（秒）
}

// カテゴリ別統計
export interface CategoryStats {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

// 問題の学習状況
export interface QuestionLearningStatus {
  questionId: string;
  attempts: number; // 解答回数
  accuracy: number; // 正答率
  averageTime: number; // 平均解答時間
  firstAttemptDate?: string; // 初回解答日
  lastAttemptDate?: string; // 最終解答日
  bestTime?: number; // 最短解答時間
  isCorrectOnFirst: boolean; // 初回正解かどうか
  lastResult?: boolean; // 最新の結果
}

// 月間統計
export interface MonthlyStats {
  year: number;
  month: number;
  totalDays: number; // 学習した日数
  totalQuestions: number;
  totalCorrect: number;
  totalTime: number;
  accuracy: number;
  dailyStats: DayLearningStats[];
}

// 学習トレンド（推移データ）
export interface LearningTrend {
  dates: string[]; // 日付配列
  accuracy: number[]; // 正答率の推移
  dailyTime: number[]; // 日別学習時間の推移
  dailyQuestions: number[]; // 日別解答数の推移
}