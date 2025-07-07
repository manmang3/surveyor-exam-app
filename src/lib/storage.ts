import {
  LearningData,
  AnswerRecord,
  LearningStatistics,
  QuestionLearningStatus,
  CategoryStats,
  DayLearningStats,
  MonthlyStats,
  LearningTrend
} from '@/types/learning';
import { sampleQuestions } from '@/data/questions';

export class LearningStorage {
  private static readonly STORAGE_KEY = 'surveyorLearningData';
  private static readonly VERSION = '1.0.0';

  /**
   * デフォルトの学習データを生成
   */
  private static getDefaultData(): LearningData {
    const now = new Date().toISOString();
    return {
      answers: {},
      dailyStats: {},
      settings: {
        startDate: now,
        lastAccess: now
      }
    };
  }

  /**
   * ローカルストレージから学習データを取得
   */
  static getData(): LearningData {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return this.getDefaultData();
      }

      const parsed = JSON.parse(data);
      
      // データ構造の妥当性チェック
      if (!parsed.answers || !parsed.dailyStats || !parsed.settings) {
        console.warn('学習データの構造が不正です。初期化します。');
        return this.getDefaultData();
      }

      // 最終アクセス日を更新
      parsed.settings.lastAccess = new Date().toISOString();
      
      return parsed;
    } catch (error) {
      console.error('学習データの読み込みに失敗しました:', error);
      return this.getDefaultData();
    }
  }

  /**
   * 学習データをローカルストレージに保存
   */
  private static saveData(data: LearningData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('学習データの保存に失敗しました:', error);
    }
  }

  /**
   * 問題の解答履歴を記録
   */
  static saveAnswer(questionId: string, answer: AnswerRecord): void {
    const data = this.getData();

    // 問題履歴を追加
    if (!data.answers[questionId]) {
      data.answers[questionId] = { attempts: [] };
    }
    data.answers[questionId].attempts.push(answer);

    // 日別統計を更新
    const date = answer.answeredAt.split('T')[0]; // YYYY-MM-DD形式
    if (!data.dailyStats[date]) {
      data.dailyStats[date] = {
        totalProblems: 0,
        correctAnswers: 0,
        totalTime: 0
      };
    }

    const dayStats = data.dailyStats[date];
    dayStats.totalProblems += 1;
    if (answer.isCorrect) {
      dayStats.correctAnswers += 1;
    }
    dayStats.totalTime += Math.ceil(answer.answerTime / 60); // 秒を分に変換

    this.saveData(data);
  }

  /**
   * 特定の問題の生データを取得
   */
  static getQuestionData(questionId: string) {
    const data = this.getData();
    return data.answers[questionId] || null;
  }

  /**
   * 特定の問題の学習状況を取得
   */
  static getQuestionStatus(questionId: string): QuestionLearningStatus {
    const data = this.getData();
    const history = data.answers[questionId];

    if (!history || history.attempts.length === 0) {
      return {
        questionId,
        attempts: 0,
        accuracy: 0,
        averageTime: 0,
        isCorrectOnFirst: false
      };
    }

    const attempts = history.attempts;
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const totalTime = attempts.reduce((sum, a) => sum + a.answerTime, 0);
    
    return {
      questionId,
      attempts: attempts.length,
      accuracy: Math.round((correctCount / attempts.length) * 100),
      averageTime: Math.round(totalTime / attempts.length),
      firstAttemptDate: attempts[0].answeredAt,
      lastAttemptDate: attempts[attempts.length - 1].answeredAt,
      bestTime: Math.min(...attempts.map(a => a.answerTime)),
      isCorrectOnFirst: attempts[0].isCorrect,
      lastResult: attempts[attempts.length - 1].isCorrect
    };
  }

  /**
   * 全体の学習統計を取得
   */
  static getOverallStatistics(): LearningStatistics {
    const data = this.getData();
    
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTimeSeconds = 0;

    // 問題別統計を集計
    Object.values(data.answers).forEach(history => {
      history.attempts.forEach(attempt => {
        totalQuestions += 1;
        if (attempt.isCorrect) {
          totalCorrect += 1;
        }
        totalTimeSeconds += attempt.answerTime;
      });
    });

    // 日別統計から累計学習時間を取得
    const totalTimeMinutes = Object.values(data.dailyStats)
      .reduce((sum, day) => sum + day.totalTime, 0);

    // 連続学習日数を計算
    const streakDays = this.calculateStreakDays(data);

    return {
      totalQuestions,
      totalCorrect,
      overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalTime: totalTimeMinutes,
      streakDays,
      averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0
    };
  }

  /**
   * 連続学習日数を計算
   */
  private static calculateStreakDays(data: LearningData): number {
    const dates = Object.keys(data.dailyStats).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      date.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 指定した日の学習統計を取得
   */
  static getDayStats(date: string): DayLearningStats | null {
    const data = this.getData();
    const dayStats = data.dailyStats[date];
    
    if (!dayStats) return null;

    return {
      date,
      ...dayStats,
      accuracy: dayStats.totalProblems > 0 
        ? Math.round((dayStats.correctAnswers / dayStats.totalProblems) * 100) 
        : 0,
      averageTime: dayStats.totalProblems > 0
        ? Math.round((dayStats.totalTime * 60) / dayStats.totalProblems) // 分を秒に変換して平均
        : 0
    };
  }

  /**
   * 指定した月の学習統計を取得
   */
  static getMonthlyStats(year: number, month: number): MonthlyStats {
    const data = this.getData();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    const dailyStats: DayLearningStats[] = [];
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTime = 0;

    // その月の日別統計を収集
    Object.entries(data.dailyStats).forEach(([date, stats]) => {
      if (date.startsWith(monthKey)) {
        const dayStats = this.getDayStats(date);
        if (dayStats) {
          dailyStats.push(dayStats);
          totalQuestions += stats.totalProblems;
          totalCorrect += stats.correctAnswers;
          totalTime += stats.totalTime;
        }
      }
    });

    return {
      year,
      month,
      totalDays: dailyStats.length,
      totalQuestions,
      totalCorrect,
      totalTime,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  /**
   * カテゴリ別の学習統計を取得
   */
  static getCategoryStats(): CategoryStats[] {
    const data = this.getData();
    const categoryMap = new Map<string, { total: number; correct: number; timeTotal: number }>();

    // 問題データからカテゴリ情報を取得
    Object.entries(data.answers).forEach(([questionId, history]) => {
      const question = sampleQuestions.find(q => q.id === questionId);
      if (!question) return;

      const category = question.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, correct: 0, timeTotal: 0 });
      }

      const categoryData = categoryMap.get(category)!;
      history.attempts.forEach(attempt => {
        categoryData.total += 1;
        if (attempt.isCorrect) {
          categoryData.correct += 1;
        }
        categoryData.timeTotal += attempt.answerTime;
      });
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      averageTime: stats.total > 0 ? Math.round(stats.timeTotal / stats.total) : 0
    }));
  }

  /**
   * 学習トレンドデータを取得（過去30日間）
   */
  static getLearningTrend(days: number = 30): LearningTrend {
    const data = this.getData();
    const dates: string[] = [];
    const accuracy: number[] = [];
    const dailyTime: number[] = [];
    const dailyQuestions: number[] = [];

    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dates.push(dateStr);
      
      const dayStats = data.dailyStats[dateStr];
      if (dayStats) {
        const dayAccuracy = dayStats.totalProblems > 0 
          ? Math.round((dayStats.correctAnswers / dayStats.totalProblems) * 100)
          : 0;
        accuracy.push(dayAccuracy);
        dailyTime.push(dayStats.totalTime);
        dailyQuestions.push(dayStats.totalProblems);
      } else {
        accuracy.push(0);
        dailyTime.push(0);
        dailyQuestions.push(0);
      }
    }

    return { dates, accuracy, dailyTime, dailyQuestions };
  }

  /**
   * 学習データをエクスポート
   */
  static exportData(): string {
    const data = this.getData();
    return JSON.stringify({
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      data
    }, null, 2);
  }

  /**
   * 学習データをインポート
   */
  static importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      
      if (imported.data && imported.data.answers && imported.data.dailyStats && imported.data.settings) {
        this.saveData(imported.data);
        return true;
      } else {
        console.error('インポートデータの形式が正しくありません');
        return false;
      }
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      return false;
    }
  }

  /**
   * 学習データをリセット
   */
  static resetData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}