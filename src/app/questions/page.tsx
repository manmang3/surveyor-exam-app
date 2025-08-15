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
    '民法': ['総則', '物権', '相続'],
    '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
    '土地家屋調査士法': ['登録・移転・取消し', '業務に関する法規', '業務制限', '調査士法人', '欠格事由', '懲戒処分']
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

  // 小分類の順序マッピング（categories_*.txt ファイルの順序に基づく）
  const detailCategoryOrder = {
    // 民法
    "未成年": 0,
    "行為能力": 1,
    "権利能力なき社団": 2,
    "意思表示": 3,
    "瑕疵ある意思表示": 4,
    "代理": 5,
    "無権代理と相続": 6,
    "無効と取り消し": 7,
    "条件": 8,
    "取得時効": 9,
    "時効の援用": 10,
    "時効の更新": 11,
    "不動産": 12,
    "物件変動": 13,
    "不動産の物権変動": 14,
    "取得時効と登記": 15,
    "相続と登記": 17,
    "物件的請求権": 18,
    "占有権": 19,
    "占有訴権": 20,
    "袋地所有者の囲繞地通行権": 21,
    "囲繞地通行権": 22,
    "相隣関係": 23,
    "共有": 24,
    "地上権": 25,
    "質権": 26,
    "付合": 27,
    "相続": 28,
    "相続人": 29,
    "相続の承認・放棄": 30,
    "遺産分割": 31,
    "遺言": 32,
    "代襲相続": 33,
    // 不動産登記法
    "不動産登記制度": 34,
    "報告的登記と形式的登記": 35,
    "登記制度の変遷": 36,
    "申請義務": 37,
    "申請人適格": 38,
    "相続人その他の一般承継人": 39,
    "代位による登記": 40,
    "登記所の管轄": 41,
    "登記所における各情報の保存期間": 42,
    "実地調査": 43,
    "本人確認調査": 44,
    "登記記録": 45,
    "一不動産一登記記録主義": 46,
    "土地区画整理事業と登記記録": 47,
    "地図及び建物所在図": 48,
    "地図": 49,
    "地図に準ずる図面": 50,
    "地図の訂正": 51,
    "登記情報の公開": 52,
    "申請情報": 53,
    "添付情報": 54,
    "所有権証明書": 55,
    "法定相続情報一覧図": 56,
    "登録免許税": 57,
    "登記識別情報": 58,
    "登記識別情報（登記済証）": 59,
    "登記識別情報に関する証明": 60,
    "代理権の不消滅": 61,
    "代理人": 62,
    "特別の委任": 63,
    "一の申請情報による登記の申請": 64,
    "電子申請": 65,
    "原本還付": 66,
    "事前通知と本人確認情報": 67,
    "本人確認情報": 68,
    "登記識別情報の通知": 69,
    "登記完了証": 70,
    "登記完了証の通知": 71,
    "却下": 72,
    "却下、取下げ": 73,
    "取下げ": 74,
    "審査請求": 75,
    "筆界特定の流れ": 76,
    "筆界特定": 77,
    "表題部所有者に関する登記": 78,
    "土地に関する登記": 79,
    "地番": 80,
    "地番・家屋番号": 81,
    "地目": 82,
    "地積": 83,
    "土地の境界": 84,
    "土地の登記申請における添付図面": 85,
    "土地所在図": 86,
    "地積測量図": 87,
    "地役権図面": 88,
    "添付図面の訂正の申出": 89,
    "土地の表題登記": 90,
    "土地の表題部の変更または更正登記": 91,
    "土地分筆登記": 92,
    "土地合筆登記": 93,
    "土地合筆登記の制限": 94,
    "土地分合筆登記": 95,
    "土地の滅失登記": 96,
    "建物に関する登記": 97,
    "建物の表示に関する登記事項": 98,
    "所在": 99,
    "家屋番号": 100,
    "建物の認定": 101,
    "種類": 102,
    "構造": 103,
    "構造と床面積": 104,
    "床面積": 105,
    "建物の個数": 106,
    "附属建物": 107,
    "建物の登記申請における添付図面": 108,
    "建物の表題登記": 109,
    "建物の表題登記の意義": 110,
    "建物の表題部の変更または更正登記": 111,
    "建物分割登記": 112,
    "建物合併登記": 113,
    "建物合併登記の制限": 114,
    "建物の分割または合併の登記": 115,
    "建物の合体による登記等": 116,
    "建物の滅失登記": 117,
    "区分建物に関する登記": 118,
    "規約": 119,
    "敷地権": 120,
    "区分建物の表題登記": 121,
    "区分建物の表題部の変更または更正登記": 122,
    "共用部分または団地共用部分に関する登記": 123,
    // 土地家屋調査士法
    "登録・移転・取消し": 124,
    "業務に関する法規": 125,
    "業務制限": 126,
    "調査士法人": 127,
    "欠格事由": 128,
    "懲戒処分": 129,
    "調査士会": 130
  };

  // ソート方式の決定
  if (year) {
    // 年度別モードの場合は問題番号順（1-20問）でソート
    filteredQuestions = filteredQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
  } else {
    // 分野別モードの場合は小分類順と年度順でソート
    filteredQuestions = filteredQuestions.sort((a, b) => {
      // 1. 小分類順でソート（detailCategoryがない場合は最後）
      const aOrder = a.detailCategory ? (detailCategoryOrder[a.detailCategory as keyof typeof detailCategoryOrder] ?? 9999) : 9999;
      const bOrder = b.detailCategory ? (detailCategoryOrder[b.detailCategory as keyof typeof detailCategoryOrder] ?? 9999) : 9999;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // 2. 同じ小分類内では年度順でソート
      return a.year - b.year;
    });
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
          
          {/* 年度別の通し問題開始ボタン */}
          {year && filteredQuestions.length === 20 && (
            <div className="text-center mb-6">
              <Link
                href={`/questions/exam/${year}?${searchParams.toString()}`}
                className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {toJapaneseYear(parseInt(year))}の問題を開始する
              </Link>
            </div>
          )}
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
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    // メインカテゴリを判定
                    const getMainCategory = (category: string) => {
                      if (category === '不動産登記法') return '不動産登記法';
                      if (['総則', '物権', '相続'].includes(category)) return '民法';
                      if (category === '土地家屋調査士法') return '土地家屋調査士法';
                      return category;
                    };

                    const mainCategory = getMainCategory(question.category);
                    const isRealEstate = question.category === '不動産登記法';
                    const isSurveyorLaw = question.category === '土地家屋調査士法';
                    
                    // サブカテゴリの判定
                    let subCategory = null;
                    if (isRealEstate) {
                      subCategory = question.subcategory;
                    } else if (isSurveyorLaw) {
                      subCategory = question.subcategory;
                    } else if (mainCategory !== question.category) {
                      subCategory = question.category;
                    }

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
                        {question.detailCategory && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {question.detailCategory}
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