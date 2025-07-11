'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { sampleQuestions } from '@/data/questions';
import { ExamDateManager } from '@/lib/examDate';
import { QuoteManager } from '@/lib/quotes';
import { Quote } from '@/types/quote';

export default function Home() {
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [daysUntilExam, setDaysUntilExam] = useState<number>(0);
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);

  // メインカテゴリとサブカテゴリの構造
  const mainCategories = {
    '民法': ['代理', '物権', '債権', '相続'],
    '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
    '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
  };
  
  const years = Array.from(new Set(sampleQuestions.map(q => q.year))).sort((a, b) => b - a);
  
  // 西暦を和暦に変換する関数
  const toJapaneseYear = (year: number) => {
    if (year >= 1989 && year <= 2018) {
      return `平成${year - 1988}年`;
    } else if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else {
      return `${year}年`;
    }
  };

  // ブックマーク数と試験日までの残り日数、今日の名言を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
        setBookmarkedCount(bookmarks.length);
        
        // 試験日までの残り日数を計算
        const days = ExamDateManager.getDaysUntilExam();
        setDaysUntilExam(days);

        // 今日の名言を取得
        const quote = QuoteManager.getRandomQuote();
        setDailyQuote(quote);
      } catch (error) {
        console.error('Failed to load data:', error);
        setBookmarkedCount(0);
        setDaysUntilExam(0);
        setDailyQuote(null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            土地家屋調査士試験 過去問アプリ
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            土地家屋調査士試験まであと{daysUntilExam}日
          </p>
          
          {/* 今日の名言 */}
          {dailyQuote && (
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
              <div className="text-gray-700 text-lg italic leading-relaxed mb-3">
                「{dailyQuote.text}」
              </div>
              <div className="text-right text-sm text-gray-600">
                ― {dailyQuote.author}
                {dailyQuote.occupation && (
                  <span className="text-gray-500"> ({dailyQuote.occupation})</span>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📚 分野別
            </h2>
            <div className="space-y-3">
              {Object.entries(mainCategories).map(([mainCategory, subCategories]) => {
                const count = mainCategory === '不動産登記法'
                  ? sampleQuestions.filter(q => q.category === mainCategory).length
                  : sampleQuestions.filter(q => {
                      return subCategories.includes(q.category);
                    }).length;
                return (
                  <Link
                    key={mainCategory}
                    href={`/categories/${encodeURIComponent(mainCategory)}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{mainCategory}</span>
                      <span className="text-sm text-gray-500">{count}問</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📅 年度別
            </h2>
            <div className="space-y-3">
              {years.map(year => {
                const count = sampleQuestions.filter(q => q.year === year).length;
                return (
                  <Link
                    key={year}
                    href={`/questions?year=${year}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{toJapaneseYear(year)}</span>
                      <span className="text-sm text-gray-500">{count}問</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🎯 学習ツール
            </h2>
            <div className="space-y-3">
              <Link
                href="/questions?bookmark=true"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">📚 チェックした問題</span>
                  <span className="text-sm text-gray-500">{bookmarkedCount}問</span>
                </div>
              </Link>
              
              <Link
                href="/problems"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">🎯 問題別詳細</span>
                  <span className="text-sm text-gray-500">分析情報</span>
                </div>
              </Link>
              
              <Link
                href="/games"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">🎮 分野別ミニゲーム</span>
                  <span className="text-sm text-gray-500">遊んで学ぶ</span>
                </div>
              </Link>
              
              <Link
                href="/dashboard"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">📊 学習進捗</span>
                  <span className="text-sm text-gray-500">ダッシュボード</span>
                </div>
              </Link>
              
              <Link
                href="/settings/menu"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">⚙️ 設定</span>
                  <span className="text-sm text-gray-500">試験日・データ管理</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/questions"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            すべての問題を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
