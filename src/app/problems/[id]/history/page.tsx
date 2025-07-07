'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';
import { LearningStorage } from '@/lib/storage';
import { AnswerRecord } from '@/types/learning';
import LearningStats from '@/components/LearningStats';

interface HistoryEntry extends AnswerRecord {
  index: number;
}

export default function ProblemHistoryPage() {
  const params = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestionHistory = () => {
      try {
        const foundQuestion = sampleQuestions.find(q => q.id === params.id);
        setQuestion(foundQuestion || null);

        if (foundQuestion) {
          const questionData = LearningStorage.getQuestionData(foundQuestion.id);
          if (questionData) {
            const historyWithIndex: HistoryEntry[] = questionData.attempts.map((record, index) => ({
              ...record,
              index: index + 1
            }));
            setHistory(historyWithIndex.reverse()); // 最新順に表示
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('履歴データの読み込みに失敗しました:', error);
        setIsLoading(false);
      }
    };

    loadQuestionHistory();
  }, [params.id]);

  // 西暦を和暦に変換
  const toJapaneseYear = (year: number): string => {
    if (year >= 1989 && year <= 2018) {
      return `平成${year - 1988}年`;
    } else if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else {
      return `${year}年`;
    }
  };

  // 結果のアイコンとスタイルを取得
  const getResultDisplay = (isCorrect: boolean) => {
    if (isCorrect) {
      return {
        icon: '✅',
        text: '正解',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    } else {
      return {
        icon: '❌',
        text: '不正解',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    }
  };

  // セッションタイプの表示名を取得
  const getSessionTypeDisplay = (sessionType: string) => {
    switch (sessionType) {
      case 'individual':
        return '個別問題';
      case 'exam':
        return '試験モード';
      default:
        return sessionType;
    }
  };

  // 統計情報を計算
  const calculateStats = () => {
    if (history.length === 0) return null;

    const totalAttempts = history.length;
    const correctAnswers = history.filter(h => h.isCorrect).length;
    const accuracy = Math.round((correctAnswers / totalAttempts) * 100);
    const averageTime = Math.round(
      history.reduce((sum, h) => sum + h.answerTime, 0) / totalAttempts
    );
    const bestTime = Math.min(...history.map(h => h.answerTime));

    // 連続正解記録を計算
    let currentStreak = 0;
    let maxStreak = 0;
    for (const record of history.reverse()) {
      if (record.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalAttempts,
      correctAnswers,
      accuracy,
      averageTime,
      bestTime,
      maxStreak
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">履歴データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">問題が見つかりませんでした</p>
          <Link
            href="/problems"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            問題一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">問題履歴</h1>
              <p className="text-gray-600 mt-2">この問題の解答履歴を確認できます</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/questions/${question.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                問題を解く
              </Link>
              <Link
                href="/problems"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                問題一覧
              </Link>
            </div>
          </div>
        </div>

        {/* 問題情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{question.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{toJapaneseYear(question.year)}</span>
            <span>{question.category}</span>
            {question.subcategory && (
              <span className="text-blue-600">・{question.subcategory}</span>
            )}
            <span>第{question.questionNumber}問</span>
          </div>
        </div>

        {/* 統計情報 */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">学習統計</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats.totalAttempts}
                </div>
                <div className="text-sm text-gray-600">総挑戦回数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-gray-600">正答率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stats.averageTime}秒
                </div>
                <div className="text-sm text-gray-600">平均解答時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {stats.bestTime}秒
                </div>
                <div className="text-sm text-gray-600">最短解答時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {stats.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">正解回数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 mb-2">
                  {stats.maxStreak}
                </div>
                <div className="text-sm text-gray-600">最大連続正解</div>
              </div>
            </div>
          </div>
        )}

        {/* 学習統計とグラフ */}
        <div className="mb-8">
          <LearningStats questionId={question.id} period="all" />
        </div>

        {/* 履歴一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">解答履歴</h3>
            <p className="text-sm text-gray-600 mt-1">
              {history.length}件の解答記録があります（最新順）
            </p>
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">まだ解答履歴がありません</p>
              <Link
                href={`/questions/${question.id}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                この問題を解く
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {history.map((record, index) => {
                const result = getResultDisplay(record.isCorrect);
                const attemptDate = new Date(record.answeredAt);
                
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{result.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${result.bgColor} ${result.textColor}`}>
                              {result.text}
                            </span>
                            <span className="text-sm text-gray-600">
                              第{record.index}回目
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {attemptDate.toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {record.answerTime}秒
                        </div>
                        <div className="text-sm text-gray-600">
                          {getSessionTypeDisplay(record.sessionType)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">あなたの回答:</span>
                          <span className="ml-2 font-medium">
                            選択肢 {record.userAnswer + 1}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">正解:</span>
                          <span className="ml-2 font-medium text-green-600">
                            選択肢 {question.correctAnswer + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}