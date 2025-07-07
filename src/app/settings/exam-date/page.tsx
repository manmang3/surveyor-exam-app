'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExamDateManager } from '@/lib/examDate';

export default function ExamDateSettingPage() {
  const [examDate, setExamDate] = useState<string>('');
  const [daysUntil, setDaysUntil] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    const currentExamDate = ExamDateManager.getExamDate();
    setExamDate(ExamDateManager.formatDate(currentExamDate));
    setDaysUntil(ExamDateManager.getDaysUntilExam());
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    if (!examDate) {
      setMessage({ type: 'error', text: '試験日を選択してください' });
      return;
    }

    try {
      const newDate = new Date(examDate);
      if (isNaN(newDate.getTime())) {
        setMessage({ type: 'error', text: '有効な日付を入力してください' });
        return;
      }

      ExamDateManager.setExamDate(newDate);
      setDaysUntil(ExamDateManager.getDaysUntilExam());
      setMessage({ type: 'success', text: '試験日を保存しました' });
    } catch (error) {
      console.error('試験日の保存に失敗しました:', error);
      setMessage({ type: 'error', text: '試験日の保存に失敗しました' });
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm('試験日をデフォルト（2025年10月19日）にリセットしますか？');
    
    if (!confirmed) return;

    try {
      // LocalStorageから完全に削除
      ExamDateManager.resetExamDate();
      
      // ページをリロードして確実にデフォルト値を再計算
      window.location.reload();
    } catch (error) {
      console.error('試験日のリセットに失敗しました:', error);
      setMessage({ type: 'error', text: '試験日のリセットに失敗しました' });
    }
  };

  // メッセージを自動で消去
  const clearMessage = () => setMessage(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">設定を読み込んでいます...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">試験日の設定</h1>
              <p className="text-gray-600 mt-2">土地家屋調査士試験の日程を設定します</p>
            </div>
            <Link
              href="/settings/menu"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              設定に戻る
            </Link>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={clearMessage}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 現在の設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">現在の設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {ExamDateManager.formatDateJP(new Date(examDate))}
              </div>
              <div className="text-sm text-gray-600">設定されている試験日</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                あと{daysUntil}日
              </div>
              <div className="text-sm text-gray-600">試験日まで</div>
            </div>
          </div>
        </div>

        {/* 試験日設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">試験日を変更</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-2">
                試験日
              </label>
              <input
                type="date"
                id="examDate"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                デフォルトに戻す
              </button>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 ヒント</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• デフォルトでは直近の10月第3日曜日が設定されます</p>
            <p>• 設定した試験日はトップページに「土地家屋調査士試験まであとXX日」として表示されます</p>
            <p>• 試験日は年に一度（10月）実施されることが多いですが、正確な日程は公式サイトでご確認ください</p>
          </div>
        </div>
      </div>
    </div>
  );
}