'use client';

import Link from 'next/link';
import { LearningStorage } from '@/lib/storage';
import { ExamDateManager } from '@/lib/examDate';

export default function SettingsMenuPage() {

  const handleDataReset = () => {
    const confirmed = window.confirm(
      'これまでの本アプリケーションの学習状況と設定が消去されます。本当によろしいですか？'
    );

    if (!confirmed) return;

    try {
      // 学習データをリセット
      LearningStorage.resetData();
      // 試験日設定をリセット
      ExamDateManager.resetExamDate();
      
      alert('データをリセットしました。');
      // トップページにリダイレクト
      window.location.href = '/';
    } catch (error) {
      console.error('データリセットに失敗しました:', error);
      alert('データリセットに失敗しました。');
    }
  };

  const handleBugReport = () => {
    // X（旧Twitter）のDMページを別タブで開く
    window.open(
      'https://x.com/messages/compose?recipient_id=1935959275735797760',
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 mt-2">アプリケーションの設定を変更できます</p>
        </div>

        {/* 設定メニュー */}
        <div className="space-y-6">
          {/* 試験日の設定 */}
          <Link
            href="/settings/exam-date"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">試験日の設定</h3>
                <p className="text-gray-600 text-sm">
                  土地家屋調査士試験の試験日を設定して、トップページに残り日数を表示します
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 要望・不具合報告 */}
          <button
            onClick={handleBugReport}
            className="w-full text-left bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">💬</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">要望・不具合報告</h3>
                <p className="text-gray-600 text-sm">
                  アプリの改善要望や不具合をX（旧Twitter）のダイレクトメッセージで報告できます
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </button>

          {/* データリセット */}
          <button
            onClick={handleDataReset}
            className="w-full text-left bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">🗑️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">データリセット</h3>
                <p className="text-red-700 text-sm">
                  学習状況と設定をすべてリセットします。この操作は元に戻せません。
                </p>
              </div>
              <div className="text-red-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">ご注意</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• 学習データはブラウザのローカルストレージに保存されています</p>
            <p>• ブラウザのデータを削除すると学習記録も消去されます</p>
            <p>• 定期的にデータのエクスポート（バックアップ）をお勧めします</p>
          </div>
        </div>
      </div>
    </div>
  );
}