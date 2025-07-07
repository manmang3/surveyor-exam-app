'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sampleQuestions } from '@/data/questions';

interface ExamState {
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: number;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
}

export default function ExamResultPage() {
  const params = useParams();
  const year = params.year as string;
  const [examState, setExamState] = useState<ExamState | null>(null);

  // 年度別の問題を取得（1-20問）
  const yearQuestions = sampleQuestions
    .filter(q => q.year === parseInt(year))
    .sort((a, b) => a.questionNumber - b.questionNumber)
    .slice(0, 20);

  // 西暦を和暦に変換
  const toJapaneseYear = (year: number) => {
    if (year >= 1989 && year <= 2018) {
      return `平成${year - 1988}年`;
    } else if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else {
      return `${year}年`;
    }
  };

  // LocalStorageキー
  const getStorageKey = () => `examMode_${year}`;

  // 状態を復元
  const loadExamState = (): ExamState | null => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  // 初期化時に保存された状態を確認
  useEffect(() => {
    const savedState = loadExamState();
    if (savedState && savedState.isCompleted) {
      setExamState(savedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // 時間フォーマット
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 正答数計算
  const calculateScore = (): number => {
    if (!examState) return 0;
    return examState.answers.reduce((score: number, answer, index) => {
      if (answer !== null && answer === yearQuestions[index]?.correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  if (!examState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">試験結果が見つかりませんでした</h1>
          <Link
            href={`/questions?year=${year}`}
            className="text-blue-600 hover:text-blue-800"
          >
            問題一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const isPerfectScore = score === 20;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 結果サマリー */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          {isPerfectScore && (
            <div className="confetti-container mb-6">
              {/* 花吹雪エフェクト用のCSS */}
              <style jsx>{`
                .confetti-container {
                  position: relative;
                  height: 100px;
                  overflow: hidden;
                }
                .confetti {
                  position: absolute;
                  width: 10px;
                  height: 10px;
                  background: gold;
                  animation: confetti-fall 3s linear infinite;
                }
                @keyframes confetti-fall {
                  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                  100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
                }
              `}</style>
              {/* 花吹雪要素 */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['gold', 'silver', '#ff6b6b', '#4ecdc4', '#45b7d1'][i % 5],
                  }}
                />
              ))}
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-4">
            {toJapaneseYear(parseInt(year))} 完了！
          </h1>
          
          <div className="text-6xl mb-4">
            {isPerfectScore ? '🎉' : score >= 15 ? '😊' : score >= 10 ? '😐' : '😞'}
          </div>
          
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{score}</p>
              <p className="text-gray-600">正解数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">20</p>
              <p className="text-gray-600">総問題数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{Math.round((score / 20) * 100)}%</p>
              <p className="text-gray-600">正答率</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            タイム: {formatTime(examState.elapsedTime)}
          </p>
          
          {isPerfectScore && (
            <p className="text-lg font-bold text-yellow-600 mb-4">
              🏆 全問正解おめでとうございます！ 🏆
            </p>
          )}
        </div>

        {/* 問題別結果一覧 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">問題別結果</h2>
          
          {/* 凡例 */}
          <div className="flex justify-center space-x-6 mb-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>正解</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>不正解</span>
            </div>
          </div>

          {/* 結果グリッド */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
            {examState.answers.map((answer, index) => {
              const question = yearQuestions[index];
              const isCorrect = answer !== null && answer === question?.correctAnswer;
              const isAnswered = answer !== null;
              
              return (
                <Link
                  key={index}
                  href={`/questions/${question?.id}?backToExamResult=${year}&examMode=true`}
                  className={`
                    aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-sm font-semibold transition-all hover:scale-105 cursor-pointer
                    ${isAnswered 
                      ? isCorrect 
                        ? 'bg-green-500 border-green-600 text-white' 
                        : 'bg-red-500 border-red-600 text-white'
                      : 'bg-gray-400 border-gray-500 text-white'
                    }
                  `}
                  title={`問${index + 1}: ${isAnswered ? (isCorrect ? '正解' : '不正解') : '未回答'}`}
                >
                  <div className="text-xs">問{index + 1}</div>
                  <div className="text-lg">
                    {isAnswered 
                      ? isCorrect 
                        ? '○' 
                        : '×'
                      : '－'
                    }
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 詳細統計 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {examState.answers.filter((answer, index) => 
                    answer !== null && answer === yearQuestions[index]?.correctAnswer
                  ).length}
                </p>
                <p className="text-sm text-green-700">正解</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {examState.answers.filter((answer, index) => 
                    answer !== null && answer !== yearQuestions[index]?.correctAnswer
                  ).length}
                </p>
                <p className="text-sm text-red-700">不正解</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            各問題をタップすると詳細が確認できます
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/questions?year=${year}`}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              問題一覧に戻る
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem(getStorageKey());
                window.location.href = `/questions/exam/${year}`;
              }}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              もう一度挑戦
            </button>

            <Link
              href="/"
              className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}