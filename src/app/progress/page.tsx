'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearningStorage } from '@/lib/storage';
import { DayLearningStats } from '@/types/learning';

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  stats?: DayLearningStats;
}

export default function ProgressPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayLearningStats | null>(null);
  const [showModal, setShowModal] = useState(false);

  // カレンダーデータを生成
  const generateCalendar = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダーの最初の日（前月の日曜日から）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // カレンダーの最後の日（翌月の土曜日まで）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const stats = LearningStorage.getDayStats(dateStr);
      
      days.push({
        date: dateStr,
        isCurrentMonth,
        stats: stats || undefined
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  useEffect(() => {
    const days = generateCalendar(currentDate);
    setCalendarDays(days);
  }, [currentDate]);

  // 前月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // 次月に移動
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 日付クリック時の処理
  const handleDayClick = (day: CalendarDay) => {
    if (day.stats) {
      setSelectedDay(day.stats);
      setShowModal(true);
    }
  };

  // 正答率に基づく背景色を取得
  const getDayBackgroundColor = (stats?: DayLearningStats) => {
    if (!stats || stats.totalProblems === 0) {
      return 'bg-gray-100 text-gray-400';
    }
    
    if (stats.accuracy >= 80) {
      return 'bg-green-200 text-green-800 hover:bg-green-300';
    } else if (stats.accuracy >= 60) {
      return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
    } else {
      return 'bg-red-200 text-red-800 hover:bg-red-300';
    }
  };

  // 月の表示形式
  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 今日の日付かどうかチェック
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">学習カレンダー</h1>
              <p className="text-gray-600 mt-2">日々の学習進捗を確認できます</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボード
            </Link>
          </div>
        </div>

        {/* カレンダーヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← 前月
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatMonth(currentDate)}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              次月 →
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayNumber = new Date(day.date).getDate();
              const bgColor = getDayBackgroundColor(day.stats);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative p-2 text-center cursor-pointer transition-colors
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${bgColor}
                    ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                    ${day.stats ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="text-sm font-medium mb-1">{dayNumber}</div>
                  {day.stats && (
                    <div className="text-xs space-y-0.5">
                      <div>{day.stats.totalProblems}問</div>
                      <div>{day.stats.accuracy}%</div>
                      <div>{day.stats.totalTime}分</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>未学習</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>60%未満</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span>60-79%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>80%以上</span>
            </div>
          </div>
        </div>

        {/* 詳細モーダル */}
        {showModal && selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(selectedDay.date).toLocaleDateString('ja-JP')}の学習記録
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">解答した問題数</span>
                  <span className="font-semibold">{selectedDay.totalProblems}問</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">正解数</span>
                  <span className="font-semibold">{selectedDay.correctAnswers}問</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">正答率</span>
                  <span className={`font-semibold ${
                    selectedDay.accuracy >= 80 ? 'text-green-600' :
                    selectedDay.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedDay.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">学習時間</span>
                  <span className="font-semibold">{selectedDay.totalTime}分</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均解答時間</span>
                  <span className="font-semibold">{selectedDay.averageTime}秒</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}