'use client';

import { useState, useEffect } from 'react';
import { LearningStorage } from '@/lib/storage';
import LearningChart from './LearningChart';

interface LearningStatsProps {
  questionId?: string; // 特定の問題の統計を表示する場合
  period?: 'week' | 'month' | 'all';
}

interface TrendData {
  date: string;
  accuracy: number;
  problems: number;
  time: number;
}

export default function LearningStats({ questionId, period = 'month' }: LearningStatsProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrendData = () => {
      try {
        const now = new Date();
        const trends: TrendData[] = [];

        if (questionId) {
          // 特定の問題の履歴データを取得
          const questionData = LearningStorage.getQuestionData(questionId);
          if (questionData) {
            // 日別に集計
            const dailyData: { [date: string]: { correct: number; total: number; time: number } } = {};
            
            questionData.attempts.forEach(attempt => {
              const date = attempt.answeredAt.split('T')[0];
              if (!dailyData[date]) {
                dailyData[date] = { correct: 0, total: 0, time: 0 };
              }
              dailyData[date].total++;
              if (attempt.isCorrect) {
                dailyData[date].correct++;
              }
              dailyData[date].time += attempt.answerTime;
            });

            // 配列に変換
            Object.entries(dailyData).forEach(([date, data]) => {
              trends.push({
                date,
                accuracy: Math.round((data.correct / data.total) * 100),
                problems: data.total,
                time: Math.round(data.time / 60) // 分に変換
              });
            });
          }
        } else {
          // 全体の学習履歴を取得
          const startDate = new Date(now);
          
          switch (period) {
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'all':
              startDate.setMonth(now.getMonth() - 6); // 最大6ヶ月
              break;
          }

          // 期間内の日別データを取得
          for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayStats = LearningStorage.getDayStats(dateStr);
            
            if (dayStats && dayStats.totalProblems > 0) {
              trends.push({
                date: dateStr,
                accuracy: dayStats.accuracy,
                problems: dayStats.totalProblems,
                time: dayStats.totalTime
              });
            }
          }
        }

        // 日付順にソート
        trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTrendData(trends);
        setIsLoading(false);
      } catch (error) {
        console.error('学習統計の読み込みに失敗しました:', error);
        setIsLoading(false);
      }
    };

    loadTrendData();
  }, [questionId, period]);

  // 統計サマリーを計算
  const calculateSummary = () => {
    if (trendData.length === 0) return null;

    const totalProblems = trendData.reduce((sum, day) => sum + day.problems, 0);
    const totalTime = trendData.reduce((sum, day) => sum + day.time, 0);
    const averageAccuracy = Math.round(
      trendData.reduce((sum, day) => sum + day.accuracy, 0) / trendData.length
    );

    // 学習日数
    const studyDays = trendData.length;
    
    // 最高正答率
    const bestAccuracy = Math.max(...trendData.map(d => d.accuracy));
    
    // 最近の傾向（最後の3日間の平均と前の3日間の平均を比較）
    let trend = 'stable';
    if (trendData.length >= 6) {
      const recent = trendData.slice(-3).reduce((sum, d) => sum + d.accuracy, 0) / 3;
      const previous = trendData.slice(-6, -3).reduce((sum, d) => sum + d.accuracy, 0) / 3;
      
      if (recent > previous + 5) {
        trend = 'improving';
      } else if (recent < previous - 5) {
        trend = 'declining';
      }
    }

    return {
      totalProblems,
      totalTime,
      averageAccuracy,
      studyDays,
      bestAccuracy,
      trend
    };
  };

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return { icon: '📈', text: '上昇傾向', color: 'text-green-600' };
      case 'declining':
        return { icon: '📉', text: '下降傾向', color: 'text-red-600' };
      default:
        return { icon: '➡️', text: '安定', color: 'text-blue-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* サマリー統計 */}
      {summary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {questionId ? '問題別学習統計' : '学習統計サマリー'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {summary.totalProblems}
              </div>
              <div className="text-sm text-gray-600">解答問題数</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {summary.averageAccuracy}%
              </div>
              <div className="text-sm text-gray-600">平均正答率</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.floor(summary.totalTime / 60)}h {summary.totalTime % 60}m
              </div>
              <div className="text-sm text-gray-600">総学習時間</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {summary.studyDays}
              </div>
              <div className="text-sm text-gray-600">学習日数</div>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {summary.bestAccuracy}%
              </div>
              <div className="text-sm text-gray-600">最高正答率</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">
                {getTrendIcon(summary.trend).icon}
              </div>
              <div className={`text-sm font-medium ${getTrendIcon(summary.trend).color}`}>
                {getTrendIcon(summary.trend).text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* グラフ */}
      {trendData.length > 0 && (
        <>
          <LearningChart
            data={trendData.map(d => ({ date: d.date, value: d.accuracy }))}
            title="正答率の推移"
            type="line"
            color="#10B981"
            yAxisLabel="正答率 (%)"
          />
          
          <LearningChart
            data={trendData.map(d => ({ date: d.date, value: d.problems }))}
            title="解答問題数の推移"
            type="bar"
            color="#3B82F6"
            yAxisLabel="問題数"
          />
          
          <LearningChart
            data={trendData.map(d => ({ date: d.date, value: d.time }))}
            title="学習時間の推移"
            type="bar"
            color="#8B5CF6"
            yAxisLabel="時間 (分)"
          />
        </>
      )}

      {trendData.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">
            {questionId ? 'この問題の学習データがありません' : '指定期間の学習データがありません'}
          </p>
          {questionId && (
            <button
              onClick={() => window.location.href = `/questions/${questionId}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              この問題を解く
            </button>
          )}
        </div>
      )}
    </div>
  );
}