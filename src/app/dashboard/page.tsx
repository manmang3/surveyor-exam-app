'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearningStorage } from '@/lib/storage';
import { LearningStatistics, DayLearningStats, CategoryStats } from '@/types/learning';

export default function DashboardPage() {
  const [stats, setStats] = useState<LearningStatistics | null>(null);
  const [todayStats, setTodayStats] = useState<DayLearningStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // 全体統計を取得
        const overallStats = LearningStorage.getOverallStatistics();
        setStats(overallStats);

        // 今日の統計を取得
        const today = new Date().toISOString().split('T')[0];
        const todayData = LearningStorage.getDayStats(today);
        setTodayStats(todayData);

        // カテゴリ別統計を取得
        const categories = LearningStorage.getCategoryStats();
        setCategoryStats(categories);

        setIsLoading(false);
      } catch (error) {
        console.error('ダッシュボードデータの読み込みに失敗しました:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">学習ダッシュボード</h1>
              <p className="text-gray-600 mt-2">あなたの学習進捗を確認できます</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              問題に戻る
            </Link>
          </div>
        </div>

        {/* 今日の学習状況 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">今日の学習状況</h2>
          {todayStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {todayStats.totalProblems}
                </div>
                <div className="text-sm text-gray-600">解答した問題数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {todayStats.accuracy}%
                </div>
                <div className="text-sm text-gray-600">正答率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {todayStats.totalTime}
                </div>
                <div className="text-sm text-gray-600">学習時間（分）</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">今日はまだ学習していません</p>
              <Link
                href="/"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                学習を始める
              </Link>
            </div>
          )}
        </div>

        {/* 全体の学習状況 */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">全体の学習状況</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">総解答問題数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.overallAccuracy}%
                </div>
                <div className="text-sm text-gray-600">全体正答率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                </div>
                <div className="text-sm text-gray-600">累計学習時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {stats.streakDays}
                </div>
                <div className="text-sm text-gray-600">連続学習日数</div>
              </div>
            </div>
          </div>
        )}

        {/* 科目別正答率 */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">科目別正答率</h2>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.accuracy}% ({category.correctAnswers}/{category.totalQuestions})
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2 flex">
                      <div
                        className="h-2 bg-green-500 rounded-l-full"
                        style={{ width: `${category.accuracy}%` }}
                      ></div>
                      <div
                        className="h-2 bg-gray-300 rounded-r-full"
                        style={{ width: `${100 - category.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/progress"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">学習カレンダー</h3>
              <p className="text-gray-600 text-sm">日々の学習進捗をカレンダーで確認</p>
            </div>
          </Link>



          <Link
            href="/stats"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">詳細統計</h3>
              <p className="text-gray-600 text-sm">学習分析とグラフ表示</p>
            </div>
          </Link>
        </div>

        {/* 設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">設定</h3>
          <div className="flex gap-4">
            <Link
              href="/settings/menu"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium text-gray-900">設定</div>
                <div className="text-xs text-gray-600 mt-1">試験日・データ管理</div>
              </div>
            </Link>
          </div>
        </div>

        {/* 学習のヒント */}
        {stats && stats.totalQuestions === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">学習を始めましょう！</h3>
            <p className="text-blue-800 mb-4">
              まだ学習履歴がありません。問題を解いて学習進捗を記録しましょう。
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              学習を始める
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}