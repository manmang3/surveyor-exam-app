'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AchievementManager, Achievement } from '@/lib/achievements';

export default function GamesMenuPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // 実績を取得
    const achievementList = AchievementManager.getAllAchievements();
    setAchievements(achievementList);
  }, []);

  // 地目ラン関連の実績をフィルタ
  const chimokuRunAchievements = achievements.filter(achievement => 
    achievement.id.includes('chimoku_run')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎮 分野別ミニゲーム</h1>
          <p className="text-gray-600 text-lg">
            楽しみながら学習できるミニゲームで知識を定着させましょう
          </p>
        </div>

        {/* ゲーム一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 地目ラン */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
              <div className="text-4xl mb-3">🏃‍♂️</div>
              <h2 className="text-2xl font-bold mb-2">地目ラン</h2>
              <p className="text-sm opacity-90">
                正しい地目を選んで走り抜けよう！
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">ゲーム内容：</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 制限時間内に20問の地目問題に挑戦</li>
                  <li>• 正しい選択肢の道を選んで進もう</li>
                  <li>• タップして加速してタイムを縮めよう</li>
                  <li>• 間違えるとゲームオーバー</li>
                </ul>
              </div>

              {/* 実績表示 */}
              {chimokuRunAchievements.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">🏆 獲得実績：</h3>
                  <div className="space-y-2">
                    {chimokuRunAchievements.map((achievement) => (
                      <div key={achievement.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">🏅</span>
                          <div>
                            <div className="font-medium text-sm">{achievement.title}</div>
                            <div className="text-xs text-gray-500">
                              {achievement.unlockedAt.toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/games/chimoku-run"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
              >
                🚀 プレイ開始
              </Link>
            </div>
          </div>

          {/* 今後追加予定のゲーム */}
          <div className="bg-white rounded-xl shadow-lg opacity-60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-6 text-white">
              <div className="text-4xl mb-3">🧩</div>
              <h2 className="text-2xl font-bold mb-2">法令パズル</h2>
              <p className="text-sm opacity-90">
                条文を正しい順序に並べよう！
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">ゲーム内容：</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 法令の条文を正しい順序に並び替え</li>
                  <li>• ドラッグ&ドロップで直感的操作</li>
                  <li>• 段階的に難易度アップ</li>
                  <li>• 制限時間内にクリアを目指そう</li>
                </ul>
              </div>

              <div className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold text-center">
                🔜 準備中
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg opacity-60 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white">
              <div className="text-4xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold mb-2">計算シューティング</h2>
              <p className="text-sm opacity-90">
                測量計算で的を撃ち抜け！
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">ゲーム内容：</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 測量計算問題を素早く解答</li>
                  <li>• 正解で的を撃破</li>
                  <li>• コンボでボーナスポイント</li>
                  <li>• 制限時間とのバトル</li>
                </ul>
              </div>

              <div className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold text-center">
                🔜 準備中
              </div>
            </div>
          </div>
        </div>

        {/* 全実績表示 */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 全実績一覧</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏅</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        達成日時: {achievement.unlockedAt.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">まだ実績がありません</h2>
            <p className="text-gray-600">
              ミニゲームをプレイして実績を獲得しよう！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}