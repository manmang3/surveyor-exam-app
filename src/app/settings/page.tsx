'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearningStorage } from '@/lib/storage';

export default function SettingsPage() {
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // データエクスポート
  const handleExport = () => {
    try {
      setIsExporting(true);
      const data = LearningStorage.exportData();
      setExportData(data);
      setMessage({ type: 'success', text: 'データのエクスポートが完了しました' });
    } catch {
      setMessage({ type: 'error', text: 'データのエクスポートに失敗しました' });
    } finally {
      setIsExporting(false);
    }
  };

  // データダウンロード
  const handleDownload = () => {
    if (!exportData) return;

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surveyor-learning-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage({ type: 'success', text: 'データファイルをダウンロードしました' });
  };

  // データインポート
  const handleImport = () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'インポートするデータを入力してください' });
      return;
    }

    const confirmed = window.confirm(
      '現在の学習データが上書きされます。この操作は元に戻せません。続行しますか？'
    );

    if (!confirmed) return;

    try {
      setIsImporting(true);
      const success = LearningStorage.importData(importData);
      
      if (success) {
        setMessage({ type: 'success', text: 'データのインポートが完了しました' });
        setImportData('');
        // ページをリロードして新しいデータを反映
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'データの形式が正しくありません' });
      }
    } catch {
      setMessage({ type: 'error', text: 'データのインポートに失敗しました' });
    } finally {
      setIsImporting(false);
    }
  };

  // ファイルからインポート
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  // データリセット
  const handleReset = () => {
    const confirmed = window.confirm(
      '全ての学習データが削除されます。この操作は元に戻せません。本当に削除しますか？'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      '最終確認: 本当に全ての学習データを削除しますか？'
    );

    if (!doubleConfirmed) return;

    try {
      LearningStorage.resetData();
      setMessage({ type: 'success', text: '学習データを削除しました' });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch {
      setMessage({ type: 'error', text: 'データの削除に失敗しました' });
    }
  };

  // メッセージを自動で消去
  const clearMessage = () => setMessage(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">設定・データ管理</h1>
              <p className="text-gray-600 mt-2">学習データのバックアップと復元</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボード
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

        {/* データエクスポート */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📤 データエクスポート</h2>
          <p className="text-gray-600 mb-4">
            学習履歴をJSONファイルとしてエクスポートできます。バックアップとして保存したり、他のデバイスにインポートできます。
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? 'エクスポート中...' : 'データをエクスポート'}
            </button>

            {exportData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    エクスポートされたデータ
                  </label>
                  <textarea
                    value={exportData}
                    readOnly
                    className="w-full h-40 border border-gray-300 rounded-lg p-3 bg-gray-50 text-sm font-mono"
                    placeholder="エクスポートされたデータがここに表示されます"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ファイルとしてダウンロード
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportData);
                      setMessage({ type: 'success', text: 'クリップボードにコピーしました' });
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    クリップボードにコピー
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* データインポート */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📥 データインポート</h2>
          <p className="text-gray-600 mb-4">
            エクスポートしたJSONファイルから学習履歴を復元できます。
            <span className="text-red-600 font-medium">※ 現在のデータは上書きされます</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ファイルから選択
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                または、JSONデータを直接貼り付け
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-40 border border-gray-300 rounded-lg p-3 text-sm font-mono"
                placeholder="エクスポートしたJSONデータをここに貼り付けてください"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={isImporting || !importData.trim()}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isImporting ? 'インポート中...' : 'データをインポート'}
            </button>
          </div>
        </div>

        {/* データリセット */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-red-900 mb-4">⚠️ 危険な操作</h2>
          <p className="text-gray-600 mb-4">
            以下の操作は元に戻すことができません。十分注意して実行してください。
          </p>
          
          <button
            onClick={handleReset}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            全ての学習データを削除
          </button>
        </div>

        {/* 使用方法 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 使用方法</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>バックアップ:</strong> 定期的にデータをエクスポートして保存しておくことをお勧めします</p>
            <p>• <strong>デバイス間の同期:</strong> あるデバイスでエクスポート → 他のデバイスでインポート</p>
            <p>• <strong>データ移行:</strong> ブラウザの変更やPCの買い替え時にデータを移行できます</p>
            <p>• <strong>リセット:</strong> 学習をやり直したい場合に全データを削除できます</p>
          </div>
        </div>
      </div>
    </div>
  );
}