'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';
import { Suspense, useState, useEffect } from 'react';

function QuestionsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const mainCategory = searchParams.get('maincategory');
  const year = searchParams.get('year');
  const bookmark = searchParams.get('bookmark');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

  let filteredQuestions: Question[] = sampleQuestions;
  let title = 'すべての問題';

  // メインカテゴリとサブカテゴリの構造
  const mainCategories = {
    '民法': ['代理', '物権', '債権', '相続'],
    '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
    '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
  };

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

  // ブックマーク状態をlocalStorageから読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
        setBookmarkedQuestions(bookmarks);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        setBookmarkedQuestions([]);
      }
    }
  }, []);

  // ブックマークフィルタの場合は、ブックマーク状態が読み込まれてからフィルタリングを適用
  if (bookmark === 'true') {
    filteredQuestions = sampleQuestions.filter(q => bookmarkedQuestions.includes(q.id));
    title = 'チェックした問題';
  }

  // ブックマークトグル関数
  const toggleBookmark = (questionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (typeof window === 'undefined') return;
    
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
      const isCurrentlyBookmarked = bookmarks.includes(questionId);
      
      let updatedBookmarks;
      if (isCurrentlyBookmarked) {
        updatedBookmarks = bookmarks.filter((id: string) => id !== questionId);
      } else {
        updatedBookmarks = [...bookmarks, questionId];
      }
      
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
      setBookmarkedQuestions(updatedBookmarks);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  if (category && subcategory) {
    filteredQuestions = sampleQuestions.filter(q => q.category === category && q.subcategory === subcategory);
    title = `${category} - ${subcategory} の問題`;
  } else if (category) {
    filteredQuestions = sampleQuestions.filter(q => q.category === category);
    title = `${category} の問題`;
  } else if (mainCategory) {
    const subCategories = mainCategories[mainCategory as keyof typeof mainCategories] || [];
    filteredQuestions = sampleQuestions.filter(q => {
      return subCategories.includes(q.category);
    });
    title = `${mainCategory} の問題`;
  } else if (year) {
    const yearNum = parseInt(year);
    filteredQuestions = sampleQuestions.filter(q => q.year === yearNum);
    title = `${toJapaneseYear(yearNum)} の問題`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">全{filteredQuestions.length}問</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuestions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}?${searchParams.toString()}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-500">
                  {toJapaneseYear(question.year)} 第{question.questionNumber}問
                </span>
                <button
                  onClick={(e) => toggleBookmark(question.id, e)}
                  className={`p-1 rounded transition-colors duration-200 hover:bg-gray-100 ${
                    bookmarkedQuestions.includes(question.id) ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  title={bookmarkedQuestions.includes(question.id) ? 'ブックマークを外す' : 'ブックマークに追加'}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={bookmarkedQuestions.includes(question.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </button>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {question.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {question.content}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  {(() => {
                    // メインカテゴリを判定
                    const getMainCategory = (category: string) => {
                      if (category === '不動産登記法') return '不動産登記法';
                      if (['代理', '物権', '債権', '相続'].includes(category)) return '民法';
                      if (['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分'].includes(category)) return '土地家屋調査士法';
                      return category;
                    };

                    const mainCategory = getMainCategory(question.category);
                    const isRealEstate = question.category === '不動産登記法';
                    const subCategory = isRealEstate ? question.subcategory : 
                                       mainCategory !== question.category ? question.category : null;

                    return (
                      <>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {mainCategory}
                        </span>
                        {subCategory && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {subCategory}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">該当する問題が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-lg text-gray-600">読み込み中...</div>
      </div>
    </div>}>
      <QuestionsContent />
    </Suspense>
  );
}