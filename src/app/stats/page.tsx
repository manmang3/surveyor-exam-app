'use client';

import { useState } from 'react';
import Link from 'next/link';
import LearningStats from '@/components/LearningStats';

export default function StatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">学習統計・分析</h1>
              <p className="text-gray-600 mt-2">詳細な学習進捗とパフォーマンス分析</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボード
            </Link>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">表示期間</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              過去1週間
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              過去1ヶ月
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全期間
            </button>
          </div>
        </div>

        {/* 学習統計とグラフ */}
        <LearningStats period={selectedPeriod} />

        {/* 学習のヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 学習分析のヒント</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>正答率の推移:</strong> 安定して80%以上を維持することを目標にしましょう</p>
            <p>• <strong>学習時間:</strong> 毎日少しずつでも継続することが重要です</p>
            <p>• <strong>問題数:</strong> 幅広い分野から均等に問題を解くことで総合力が向上します</p>
            <p>• <strong>傾向分析:</strong> 下降傾向が続く場合は、復習に重点を置きましょう</p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Link
              href="/problems"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              苦手分野を確認
            </Link>
            <Link
              href="/progress"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              カレンダーで確認
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}