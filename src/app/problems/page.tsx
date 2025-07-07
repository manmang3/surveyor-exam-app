'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';
import { LearningStorage } from '@/lib/storage';
import { QuestionLearningStatus } from '@/types/learning';

interface QuestionWithStatus extends Question {
  status: QuestionLearningStatus;
}

export default function ProblemsPage() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithStatus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  // カテゴリ一覧を取得
  const categories = Array.from(new Set(sampleQuestions.map(q => q.category)));

  useEffect(() => {
    const loadQuestions = () => {
      try {
        // 各問題の学習状況を取得
        const questionsWithStatus: QuestionWithStatus[] = sampleQuestions.map(question => ({
          ...question,
          status: LearningStorage.getQuestionStatus(question.id)
        }));

        setQuestions(questionsWithStatus);
        setFilteredQuestions(questionsWithStatus);
        setIsLoading(false);
      } catch (error) {
        console.error('問題データの読み込みに失敗しました:', error);
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // フィルタリングとソート
  useEffect(() => {
    let filtered = questions;

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // 学習状況フィルター
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'not_attempted':
          filtered = filtered.filter(q => q.status.attempts === 0);
          break;
        case 'correct':
          filtered = filtered.filter(q => q.status.attempts > 0 && q.status.lastResult === true);
          break;
        case 'incorrect':
          filtered = filtered.filter(q => q.status.attempts > 0 && q.status.lastResult === false);
          break;
        case 'high_accuracy':
          filtered = filtered.filter(q => q.status.attempts > 0 && q.status.accuracy >= 80);
          break;
        case 'low_accuracy':
          filtered = filtered.filter(q => q.status.attempts > 0 && q.status.accuracy < 60);
          break;
      }
    }

    // ソート
    switch (sortBy) {
      case 'accuracy_desc':
        filtered.sort((a, b) => b.status.accuracy - a.status.accuracy);
        break;
      case 'accuracy_asc':
        filtered.sort((a, b) => a.status.accuracy - b.status.accuracy);
        break;
      case 'attempts_desc':
        filtered.sort((a, b) => b.status.attempts - a.status.attempts);
        break;
      case 'last_attempt':
        filtered.sort((a, b) => {
          if (!a.status.lastAttemptDate && !b.status.lastAttemptDate) return 0;
          if (!a.status.lastAttemptDate) return 1;
          if (!b.status.lastAttemptDate) return -1;
          return new Date(b.status.lastAttemptDate).getTime() - new Date(a.status.lastAttemptDate).getTime();
        });
        break;
      default:
        // デフォルト: 年度・問題番号順
        filtered.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return a.questionNumber - b.questionNumber;
        });
    }

    setFilteredQuestions(filtered);
  }, [questions, selectedCategory, selectedStatus, sortBy]);

  // 学習状況のステータスを取得
  const getStatusBadge = (status: QuestionLearningStatus) => {
    if (status.attempts === 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">未挑戦</span>;
    }

    if (status.lastResult === true) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">正解</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">不正解</span>;
    }
  };

  // 正答率の色分け
  const getAccuracyColor = (accuracy: number, attempts: number) => {
    if (attempts === 0) return 'text-gray-400';
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 日本語年度変換
  const toJapaneseYear = (year: number): string => {
    if (year >= 1989 && year <= 2018) {
      return `平成${year - 1988}年`;
    } else if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else {
      return `${year}年`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">問題データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">問題一覧</h1>
          <p className="text-gray-600 mt-2">全問題の学習状況を確認できます</p>
        </div>

        {/* フィルターとソート */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">科目</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべての科目</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 学習状況フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学習状況</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="not_attempted">未挑戦</option>
                <option value="correct">最新：正解</option>
                <option value="incorrect">最新：不正解</option>
                <option value="high_accuracy">正答率80%以上</option>
                <option value="low_accuracy">正答率60%未満</option>
              </select>
            </div>

            {/* ソート */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">年度・問題番号順</option>
                <option value="accuracy_desc">正答率（高い順）</option>
                <option value="accuracy_asc">正答率（低い順）</option>
                <option value="attempts_desc">挑戦回数（多い順）</option>
                <option value="last_attempt">最終挑戦日（新しい順）</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredQuestions.length}件の問題が見つかりました
          </div>
        </div>

        {/* 問題リスト */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {question.title}
                      </h3>
                      {getStatusBadge(question.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>{toJapaneseYear(question.year)}</span>
                      <span>{question.category}</span>
                      {question.subcategory && (
                        <span className="text-blue-600">・{question.subcategory}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">挑戦回数:</span>
                        <span className="ml-1 font-medium">{question.status.attempts}回</span>
                      </div>
                      <div>
                        <span className="text-gray-500">正答率:</span>
                        <span className={`ml-1 font-medium ${getAccuracyColor(question.status.accuracy, question.status.attempts)}`}>
                          {question.status.attempts > 0 ? `${question.status.accuracy}%` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">平均時間:</span>
                        <span className="ml-1 font-medium">
                          {question.status.attempts > 0 ? `${question.status.averageTime}秒` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">最終挑戦:</span>
                        <span className="ml-1 font-medium">
                          {question.status.lastAttemptDate
                            ? new Date(question.status.lastAttemptDate).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={`/questions/${question.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      問題を解く
                    </Link>
                    {question.status.attempts > 0 && (
                      <Link
                        href={`/problems/${question.id}/history`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
                      >
                        履歴詳細
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">該当する問題が見つかりませんでした</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSortBy('default');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
}