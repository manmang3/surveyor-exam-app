'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';

interface ExamState {
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: number;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;
}

export default function ExamModePage() {
  const params = useParams();
  const year = params.year as string;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 年度別の問題を取得（1-20問）
  const yearQuestions = sampleQuestions
    .filter(q => q.year === parseInt(year))
    .sort((a, b) => a.questionNumber - b.questionNumber)
    .slice(0, 20);

  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: new Array(20).fill(null),
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
    isCompleted: false,
  });

  const [showResult, setShowResult] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  const currentQuestion = yearQuestions[examState.currentQuestionIndex];

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

  // 状態を保存
  const saveExamState = (state: ExamState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    }
  };

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
    if (savedState && !savedState.isCompleted) {
      const shouldResume = window.confirm(
        `${toJapaneseYear(parseInt(year))}の続きから始めますか？\n（「キャンセル」で最初から開始）`
      );
      
      if (shouldResume) {
        setExamState({
          ...savedState,
          startTime: Date.now() - savedState.elapsedTime,
        });
      } else {
        // 新しく開始
        localStorage.removeItem(getStorageKey());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // タイマー処理
  useEffect(() => {
    if (!examState.isPaused && !examState.isCompleted && !showResult) {
      intervalRef.current = setInterval(() => {
        setExamState(prev => {
          const newState = {
            ...prev,
            elapsedTime: Date.now() - prev.startTime,
          };
          saveExamState(newState);
          return newState;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState.isPaused, examState.isCompleted, showResult]);

  // 画像の存在確認
  useEffect(() => {
    if (currentQuestion) {
      const imageName = getImageFileName(currentQuestion);
      checkImageExists(imageName).then(setHasImage);
    }
  }, [currentQuestion]);

  const getImageFileName = (question: Question): string => {
    let yearStr;
    if (question.year >= 1989 && question.year <= 2018) {
      yearStr = `h${question.year - 1988}`;
    } else if (question.year >= 2019) {
      yearStr = `r${question.year - 2018}`;
    } else {
      yearStr = question.year.toString();
    }
    return `${yearStr}-${question.questionNumber}`;
  };

  const checkImageExists = async (imageName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/images/${imageName}.png`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // 時間フォーマット
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 一時停止/再開
  const togglePause = () => {
    setExamState(prev => {
      const newState = {
        ...prev,
        isPaused: !prev.isPaused,
        startTime: !prev.isPaused ? prev.startTime : Date.now() - prev.elapsedTime,
      };
      saveExamState(newState);
      return newState;
    });
  };

  // 回答選択
  const selectAnswer = (answerIndex: number) => {
    if (showResult) return;

    setExamState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestionIndex] = answerIndex;
      const newState = {
        ...prev,
        answers: newAnswers,
      };
      saveExamState(newState);
      return newState;
    });
  };

  // 回答確定（次の問題へ）
  const confirmAnswer = () => {
    if (examState.answers[examState.currentQuestionIndex] === null) {
      alert('回答を選択してください。');
      return;
    }

    setShowResult(true);
    
    // 2秒後に次の問題または結果画面へ
    setTimeout(() => {
      setShowResult(false);
      
      if (examState.currentQuestionIndex < 19) {
        // 次の問題へ
        setExamState(prev => {
          const newState = {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            startTime: Date.now() - prev.elapsedTime, // タイマーリセット
          };
          saveExamState(newState);
          return newState;
        });
      } else {
        // 全問完了
        setExamState(prev => {
          const newState = {
            ...prev,
            isCompleted: true,
          };
          saveExamState(newState);
          return newState;
        });
      }
    }, 2000);
  };

  // 正答数計算
  const calculateScore = (): number => {
    return examState.answers.reduce((score: number, answer, index) => {
      if (answer !== null && answer === yearQuestions[index]?.correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  // 試験完了後の結果画面
  if (examState.isCompleted) {
    const score = calculateScore();
    const isPerfectScore = score === 20;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full mx-4">
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
          
          <p className="text-xl mb-2">
            <span className="font-bold text-green-600">{score}</span>/20問正解
          </p>
          
          <p className="text-lg text-gray-600 mb-6">
            タイム: {formatTime(examState.elapsedTime)}
          </p>
          
          {isPerfectScore && (
            <p className="text-lg font-bold text-yellow-600 mb-4">
              🏆 全問正解おめでとうございます！ 🏆
            </p>
          )}
          
          <div className="space-y-3">
            <Link
              href={`/questions?year=${year}`}
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              問題一覧に戻る
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem(getStorageKey());
                window.location.reload();
              }}
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              もう一度挑戦
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>問題が見つかりません</div>;
  }

  const selectedAnswer = examState.answers[examState.currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link
              href={`/questions?year=${year}`}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 中断して戻る
            </Link>
            
            {/* タイマーと一時停止ボタン */}
            <div className="flex items-center space-x-3">
              <span className="text-xl font-mono">
                {formatTime(examState.elapsedTime)}
              </span>
              <button
                onClick={togglePause}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                title={examState.isPaused ? '再開' : '一時停止'}
              >
                {examState.isPaused ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{examState.currentQuestionIndex + 1} / 20問</span>
              <span>{Math.round(((examState.currentQuestionIndex + 1) / 20) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((examState.currentQuestionIndex + 1) / 20) * 100}%` }}
              />
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900">
            {toJapaneseYear(parseInt(year))} 第{currentQuestion.questionNumber}問
          </h1>
        </div>

        {/* 問題内容 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <div className="text-lg text-gray-800 leading-relaxed break-words overflow-wrap-anywhere">
              {currentQuestion.content.split('\n').map((line, index) => (
                <div key={index} className="mb-3">
                  {line || <br />}
                </div>
              ))}
            </div>
          </div>

          {/* 画像表示 */}
          {hasImage && (
            <div className="mb-8 text-center">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Image
                  src={`/images/${getImageFileName(currentQuestion)}.png`}
                  alt={`${currentQuestion.title}の図`}
                  width={600}
                  height={400}
                  className="mx-auto max-w-full h-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* 選択肢 */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-green-50 border-green-300'
                      : index === selectedAnswer && !isCorrect
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                    : selectedAnswer === index
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => selectAnswer(index)}
                    disabled={showResult}
                    className="mt-1 mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <span className="ml-auto text-green-600 font-medium">✓ 正解</span>
                  )}
                  {showResult && index === selectedAnswer && !isCorrect && (
                    <span className="ml-auto text-red-600 font-medium">✗ 不正解</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* 回答ボタン */}
          {!showResult && (
            <div className="text-center">
              <button
                onClick={confirmAnswer}
                disabled={selectedAnswer === null}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  selectedAnswer !== null
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {examState.currentQuestionIndex < 19 ? '次の問題へ' : '結果を見る'}
              </button>
            </div>
          )}

          {/* 結果表示時の説明 */}
          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">解説</h3>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}