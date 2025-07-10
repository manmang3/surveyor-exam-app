// 実績管理システム
// 将来のアップデートでも実績データが削除されないよう、バージョン管理機能付き

export interface Achievement {
  id: string;
  type: 'game_clear' | 'time_record' | 'streak' | 'accuracy';
  title: string;
  description: string;
  unlockedAt: Date;
  data?: Record<string, unknown>; // ゲーム固有のデータ
}

export interface ChimokuRunAchievement extends Achievement {
  type: 'game_clear';
  data: {
    clearTime: number; // 秒
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
  };
}

export interface AchievementData {
  version: string; // データ構造のバージョン
  lastUpdated: Date;
  achievements: Achievement[];
}

export class AchievementManager {
  private static readonly STORAGE_KEY = 'surveyor_achievements_v1';
  private static readonly CURRENT_VERSION = '1.0.0';

  // 実績データを取得
  static getAchievements(): AchievementData {
    if (typeof window === 'undefined') {
      return {
        version: this.CURRENT_VERSION,
        lastUpdated: new Date(),
        achievements: []
      };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // 日付文字列をDateオブジェクトに変換
        data.lastUpdated = new Date(data.lastUpdated);
        data.achievements = data.achievements.map((achievement: Achievement) => ({
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        }));
        return data;
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }

    return {
      version: this.CURRENT_VERSION,
      lastUpdated: new Date(),
      achievements: []
    };
  }

  // 実績データを保存
  static saveAchievements(data: AchievementData): void {
    if (typeof window === 'undefined') return;

    try {
      data.lastUpdated = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  // 地目ランクリア実績を追加
  static unlockChimokuRunClear(clearTime: number, correctAnswers: number, totalQuestions: number): boolean {
    const data = this.getAchievements();
    
    // 既存の地目ラン実績を検索
    const existingIndex = data.achievements.findIndex(
      a => a.id === 'chimoku_run_clear' && a.type === 'game_clear'
    );

    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const achievement: ChimokuRunAchievement = {
      id: 'chimoku_run_clear',
      type: 'game_clear',
      title: '地目ランマスター',
      description: `地目ランをクリア！ (${clearTime.toFixed(2)}秒, 正解率${accuracy}%)`,
      unlockedAt: new Date(),
      data: {
        clearTime,
        correctAnswers,
        totalQuestions,
        accuracy
      }
    };

    if (existingIndex >= 0) {
      // 既存の記録がある場合、より良いタイムの場合のみ更新
      const existingAchievement = data.achievements[existingIndex] as ChimokuRunAchievement;
      if (clearTime < existingAchievement.data.clearTime) {
        data.achievements[existingIndex] = achievement;
        this.saveAchievements(data);
        return true; // 新記録
      }
      return false; // 記録更新なし
    } else {
      // 初回クリア
      data.achievements.push(achievement);
      this.saveAchievements(data);
      return true;
    }
  }

  // 地目ラン実績を取得
  static getChimokuRunAchievement(): ChimokuRunAchievement | null {
    const data = this.getAchievements();
    const achievement = data.achievements.find(
      a => a.id === 'chimoku_run_clear' && a.type === 'game_clear'
    ) as ChimokuRunAchievement;
    
    return achievement || null;
  }

  // すべての実績を取得
  static getAllAchievements(): Achievement[] {
    const data = this.getAchievements();
    return data.achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  // データのマイグレーション（将来のバージョンアップ用）
  static migrateData(data: AchievementData): AchievementData {
    // 現在はv1.0.0のみなので、そのまま返す
    // 将来のバージョンではここでデータ変換を行う
    return data;
  }
}