import { GameScore } from '@/types/game';

const GAME_STORAGE_KEY = 'chimoku_run_scores';

export interface ChimokuRunScore extends GameScore {
  id: string;
  playedAt: string;
  gameType: 'chimoku-run';
}

/**
 * ゲーム成績管理クラス
 */
export class GameStorage {
  /**
   * ゲーム成績を保存
   */
  static saveGameScore(score: GameScore): void {
    try {
      const gameScore: ChimokuRunScore = {
        ...score,
        id: `chimoku_run_${Date.now()}`,
        playedAt: new Date().toISOString(),
        gameType: 'chimoku-run'
      };

      const existingScores = this.getGameScores();
      existingScores.push(gameScore);

      // 最新50件まで保持
      const limitedScores = existingScores.slice(-50);
      
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(limitedScores));
      
      console.log(`[GameStorage] Game score saved: ${score.score} points, ${score.accuracy}% accuracy`);
    } catch (error) {
      console.error('[GameStorage] Failed to save game score:', error);
    }
  }

  /**
   * ゲーム成績一覧を取得
   */
  static getGameScores(): ChimokuRunScore[] {
    try {
      const stored = localStorage.getItem(GAME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[GameStorage] Failed to load game scores:', error);
      return [];
    }
  }

  /**
   * 最高スコアを取得
   */
  static getBestScore(): ChimokuRunScore | null {
    const scores = this.getGameScores();
    if (scores.length === 0) return null;

    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * 平均正答率を取得
   */
  static getAverageAccuracy(): number {
    const scores = this.getGameScores();
    if (scores.length === 0) return 0;

    const totalAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0);
    return Math.round(totalAccuracy / scores.length);
  }

  /**
   * ゲーム統計を取得
   */
  static getGameStats() {
    const scores = this.getGameScores();
    
    if (scores.length === 0) {
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        averageAccuracy: 0,
        totalPlayTime: 0
      };
    }

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const totalAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0);
    const totalPlayTime = scores.reduce((sum, score) => sum + score.playTime, 0);
    const bestScore = Math.max(...scores.map(score => score.score));

    return {
      totalGames: scores.length,
      bestScore,
      averageScore: Math.round(totalScore / scores.length),
      averageAccuracy: Math.round(totalAccuracy / scores.length),
      totalPlayTime: Math.round(totalPlayTime)
    };
  }

  /**
   * ゲームデータをリセット
   */
  static resetGameData(): void {
    try {
      localStorage.removeItem(GAME_STORAGE_KEY);
      console.log('[GameStorage] Game data reset successfully');
    } catch (error) {
      console.error('[GameStorage] Failed to reset game data:', error);
    }
  }
}