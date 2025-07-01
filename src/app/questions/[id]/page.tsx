'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';


export default function QuestionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [hasTable, setHasTable] = useState(false);
  const [choiceStates, setChoiceStates] = useState<Map<string, number>>(new Map());
  const [isBookmarked, setIsBookmarked] = useState(false);

  const findNextQuestion = useCallback((currentQuestion: Question): Question | null => {
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    if (year) {
      // 年度別での次の問題を探す
      const yearQuestions = sampleQuestions
        .filter(q => q.year === parseInt(year))
        .sort((a, b) => a.questionNumber - b.questionNumber);
      
      const currentIndex = yearQuestions.findIndex(q => q.id === currentQuestion.id);
      return currentIndex < yearQuestions.length - 1 ? yearQuestions[currentIndex + 1] : null;
    }
    
    if (category) {
      // カテゴリ別での次の問題を探す
      let filteredQuestions = sampleQuestions.filter(q => q.category === category);
      
      if (subcategory && category === '不動産登記法') {
        // サブカテゴリがある場合
        filteredQuestions = filteredQuestions.filter(q => q.subcategory === subcategory);
      }
      
      // 年度順、問題番号順でソート
      filteredQuestions.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.questionNumber - b.questionNumber;
      });
      
      const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestion.id);
      return currentIndex < filteredQuestions.length - 1 ? filteredQuestions[currentIndex + 1] : null;
    }
    
    // デフォルト: 全問題から次の問題
    const allQuestions = sampleQuestions.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.questionNumber - b.questionNumber;
    });
    
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestion.id);
    return currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1] : null;
  }, [searchParams]);

  useEffect(() => {
    const foundQuestion = sampleQuestions.find(q => q.id === params.id);
    setQuestion(foundQuestion || null);
    
    if (foundQuestion) {
      const next = findNextQuestion(foundQuestion);
      setNextQuestion(next);
    }
    
    // 問題が変わったら選択肢状態をリセット
    setChoiceStates(new Map());
    setSelectedAnswer(null);
    setShowResult(false);
    
  }, [params.id, searchParams, findNextQuestion]);

  // ブックマーク状態をクライアントサイドで初期化
  useEffect(() => {
    if (question && typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
      setIsBookmarked(bookmarks.includes(question.id));
    }
  }, [question]);


  const getImageFileName = (question: Question): string => {
    // 年度を変換（例: 2007 -> h19）
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

  useEffect(() => {
    if (question) {
      const imageName = getImageFileName(question);
      checkImageExists(imageName).then(setHasImage);
      
      // 表が必要な問題かチェック
      const tableQuestions = ['h19_15', 'h25_07', 'h29_13', 'r2_19'];
      setHasTable(tableQuestions.includes(question.id));
    }
  }, [question]);

  const renderTable = (questionId: string) => {
    switch (questionId) {
      case 'h19_15':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center w-12">選択肢</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">登記</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">対象書面</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">押印者</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ア</td>
                  <td className="border border-gray-300 px-3 py-2">建物の表題登記</td>
                  <td className="border border-gray-300 px-3 py-2">申請人が記名した委任状</td>
                  <td className="border border-gray-300 px-3 py-2">申請人</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">イ</td>
                  <td className="border border-gray-300 px-3 py-2">建物の合併の登記</td>
                  <td className="border border-gray-300 px-3 py-2">委任による代理人が署名した申請書</td>
                  <td className="border border-gray-300 px-3 py-2">委任による代理人</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ウ</td>
                  <td className="border border-gray-300 px-3 py-2">建物の合体の登記</td>
                  <td className="border border-gray-300 px-3 py-2">申請書に添付する建物図面で、申請人が記名したもの</td>
                  <td className="border border-gray-300 px-3 py-2">申請人</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">エ</td>
                  <td className="border border-gray-300 px-3 py-2">土地の合筆の登記</td>
                  <td className="border border-gray-300 px-3 py-2">申請人が署名した委任状であって、公証人の認証を受けたもの</td>
                  <td className="border border-gray-300 px-3 py-2">申請人</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">オ</td>
                  <td className="border border-gray-300 px-3 py-2">土地の分筆の登記</td>
                  <td className="border border-gray-300 px-3 py-2">申請書に添付する地積測量図で、その作成者が署名したもの</td>
                  <td className="border border-gray-300 px-3 py-2">地積測量図の作成者</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'h25_07':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center w-12">選択肢</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">第１欄</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">第２欄</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ア</td>
                  <td className="border border-gray-300 px-3 py-2">共有者Ａ、Ｂ、Ｃのうち、Ａのみが登記名義人となっている場合</td>
                  <td className="border border-gray-300 px-3 py-2">ＡからＤへの所有権の移転の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">イ</td>
                  <td className="border border-gray-300 px-3 py-2">ＡとＢが共有で登記名義人となっている場合</td>
                  <td className="border border-gray-300 px-3 py-2">持分の放棄を原因とするＡの持分の抹消及びＢの持分の変更の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ウ</td>
                  <td className="border border-gray-300 px-3 py-2">ＡとＢが共有で登記名義人となっている場合</td>
                  <td className="border border-gray-300 px-3 py-2">相続を原因とするＡの持分についてのＡからＣ（Ａの相続人）への持分の移転の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">エ</td>
                  <td className="border border-gray-300 px-3 py-2">ＡとＢが共有で登記名義人となっている場合</td>
                  <td className="border border-gray-300 px-3 py-2">売買を原因とするＡの持分についてのＡからＣへの持分の移転の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">オ</td>
                  <td className="border border-gray-300 px-3 py-2">Ａが単独で登記名義人となっている場合</td>
                  <td className="border border-gray-300 px-3 py-2">更正を原因とするＡとＢの共有名義への登記名義人の変更の登記</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'h29_13':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center w-12">選択肢</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Ａ欄（登記原因たる事実）</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Ｂ欄（登記の目的）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ア</td>
                  <td className="border border-gray-300 px-3 py-2">分筆線を誤って申請されたことによる分筆の登記を是正する場合</td>
                  <td className="border border-gray-300 px-3 py-2">地積に関する更正の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">イ</td>
                  <td className="border border-gray-300 px-3 py-2">天災等の自然現象によって一筆の土地の一部が常時海面下に没する状態になった場合</td>
                  <td className="border border-gray-300 px-3 py-2">地積に関する変更の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ウ</td>
                  <td className="border border-gray-300 px-3 py-2">天災等の自然現象によって一筆の土地の全部が海面下に没したが、その状態が一時的なものである場合</td>
                  <td className="border border-gray-300 px-3 py-2">滅失の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">エ</td>
                  <td className="border border-gray-300 px-3 py-2">一筆の土地の全部が河川法第6条第1項の河川区域内の土地になった場合</td>
                  <td className="border border-gray-300 px-3 py-2">河川区域内の土地である旨の登記</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">オ</td>
                  <td className="border border-gray-300 px-3 py-2">河川法第6条第1項の河川区域内の一筆の土地の一部が滅失した場合</td>
                  <td className="border border-gray-300 px-3 py-2">分筆及び滅失の登記</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'r2_19':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center w-12">選択肢</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">第1欄</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">第2欄</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">第3欄</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ア</td>
                  <td className="border border-gray-300 px-3 py-2">いずれも所有権の登記のある2筆の土地の合筆の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">所有権の登記のある土地の一部の地目が墓地になったためにする一部地目変更及び当該土地を2筆にする分筆の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">1,000円</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">イ</td>
                  <td className="border border-gray-300 px-3 py-2">2筆の土地の所有権を敷地権とする所有権の登記のある1個の区分建物を2個の区分建物とする再区分の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">国と私人が共有する所有権の登記のある土地を2筆にする分筆の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">2,000円</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">ウ</td>
                  <td className="border border-gray-300 px-3 py-2">一棟の建物にいずれも所有権の登記のある2個の区分建物が属する場合に当該2個の区分建物を1個の区分建物でない建物とする区分建物の合併の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">いずれも所有権の登記のある2個の建物が合体して1個の建物となったためにする合体による登記等の申請</td>
                  <td className="border border-gray-300 px-3 py-2">非課税</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">エ</td>
                  <td className="border border-gray-300 px-3 py-2">いずれも所有権の登記のある2筆の土地の合筆の登記を、錯誤を原因として抹消する登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">私人を所有権の登記名義人とする土地の一部を取得した地方公共団体が、私人に代位して行う当該土地を2筆にする分筆の登記の嘱託</td>
                  <td className="border border-gray-300 px-3 py-2">非課税</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">オ</td>
                  <td className="border border-gray-300 px-3 py-2">1個の建物の表題部所有者の住所の変更の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">宗教法人が所有権の登記名義人である土地を2筆にする分筆の登記の申請</td>
                  <td className="border border-gray-300 px-3 py-2">非課税</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  const getNextQuestionUrl = (): string => {
    if (!nextQuestion) return '/questions';
    
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    const url = `/questions/${nextQuestion.id}?`;
    const params = new URLSearchParams();
    
    if (year) params.set('year', year);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    
    return url + params.toString();
  };

  const getBackUrl = (): string => {
    const backToExamResult = searchParams.get('backToExamResult');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    // 試験結果画面から来た場合は、試験結果に戻る
    if (backToExamResult) {
      return `/questions/exam/${backToExamResult}/result`;
    }
    
    if (year || category || subcategory) {
      // クエリパラメータがある場合は問題一覧に戻る（フィルタ付き）
      const params = new URLSearchParams();
      if (year) params.set('year', year);
      if (category) params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      
      return `/questions?${params.toString()}`;
    }
    
    // クエリパラメータがない場合は全問題一覧
    return '/questions';
  };

  const getBackButtonText = (): string => {
    const backToExamResult = searchParams.get('backToExamResult');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    // 試験結果画面から来た場合
    if (backToExamResult) {
      const yearNum = parseInt(backToExamResult);
      const japaneseYear = yearNum >= 1989 && yearNum <= 2018 
        ? `平成${yearNum - 1988}年` 
        : yearNum >= 2019 
        ? `令和${yearNum - 2018}年` 
        : `${yearNum}年`;
      return `← ${japaneseYear}の結果に戻る`;
    }
    
    if (year) {
      const yearNum = parseInt(year);
      const japaneseYear = yearNum >= 1989 && yearNum <= 2018 
        ? `平成${yearNum - 1988}年` 
        : yearNum >= 2019 
        ? `令和${yearNum - 2018}年` 
        : `${yearNum}年`;
      return `← ${japaneseYear}の問題一覧に戻る`;
    }
    
    if (category && subcategory) {
      return `← ${category} - ${subcategory}の問題一覧に戻る`;
    }
    
    if (category) {
      return `← ${category}の問題一覧に戻る`;
    }
    
    return '← 問題一覧に戻る';
  };

  const toJapaneseYear = (year: number): string => {
    if (year >= 1989 && year <= 2018) {
      return `平成${year - 1988}年`;
    } else if (year >= 2019) {
      return `令和${year - 2018}年`;
    } else {
      return `${year}年`;
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">問題が見つかりませんでした</h1>
          <Link
            href={getBackUrl()}
            className="text-blue-600 hover:text-blue-800"
          >
            {getBackButtonText().replace('← ', '')}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;


  const toggleChoiceState = (choice: string) => {
    setChoiceStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(choice) || 0;
      const nextState = (currentState + 1) % 5; // 0-4の範囲でループ
      
      if (nextState === 0) {
        newMap.delete(choice);
      } else {
        newMap.set(choice, nextState);
      }
      
      return newMap;
    });
  };

  const getChoiceStyle = (choice: string) => {
    const state = choiceStates.get(choice) || 0;
    
    switch (state) {
      case 0: // 通常
        return {
          textClass: '',
          overlay: null
        };
      case 1: // 青い○（太い中空円）
        return {
          textClass: 'text-gray-400',
          overlay: (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="48" height="48" viewBox="0 0 48 48" className="drop-shadow-lg">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#60a5fa" strokeWidth="6"/>
              </svg>
            </div>
          )
        };
      case 2: // 赤いX（X型アイコン）
        return {
          textClass: 'text-gray-400 line-through',
          overlay: (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="48" height="48" viewBox="0 0 48 48" className="drop-shadow-lg">
                <path d="M12 12 36 36M36 12 12 36" stroke="#f87171" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </div>
          )
        };
      case 3: // 青い○？（円+疑問符）
        return {
          textClass: 'text-gray-400',
          overlay: (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="60" height="48" viewBox="0 0 60 48" className="drop-shadow-lg">
                <circle cx="18" cy="24" r="15" fill="none" stroke="#60a5fa" strokeWidth="5"/>
                <text x="42" y="32" fill="#60a5fa" fontSize="28" fontWeight="bold">?</text>
              </svg>
            </div>
          )
        };
      case 4: // 赤い×？（X+疑問符）
        return {
          textClass: 'text-gray-400 line-through',
          overlay: (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="60" height="48" viewBox="0 0 60 48" className="drop-shadow-lg">
                <path d="M9 9 27 27M27 9 9 27" stroke="#f87171" strokeWidth="5" strokeLinecap="round"/>
                <text x="39" y="32" fill="#f87171" fontSize="28" fontWeight="bold">?</text>
              </svg>
            </div>
          )
        };
      default:
        return {
          textClass: '',
          overlay: null
        };
    }
  };

  const toggleBookmark = () => {
    if (!question || typeof window === 'undefined') return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]');
    const isCurrentlyBookmarked = bookmarks.includes(question.id);
    
    if (isCurrentlyBookmarked) {
      const updatedBookmarks = bookmarks.filter((id: string) => id !== question.id);
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      const updatedBookmarks = [...bookmarks, question.id];
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
      setIsBookmarked(true);
    }
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setChoiceStates(new Map());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href={getBackUrl()}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            {getBackButtonText()}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {question.title}
              </h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{toJapaneseYear(question.year)} 第{question.questionNumber}問</span>
                <span>{question.category}</span>
                {question.subcategory && (
                  <span className="text-blue-600">・{question.subcategory}</span>
                )}
              </div>
            </div>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-400'
              }`}
              title={isBookmarked ? 'ブックマークを外す' : 'ブックマークに追加'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <div className="text-lg text-gray-800 leading-relaxed break-words overflow-wrap-anywhere">
              {question.content.split('\n').map((line, index) => {
                // 対話形式の問題でも選択肢を検出できるように改良
                // 通常の選択肢形式: ア　、1　、１　、①　など
                // 対話形式の選択肢: 学生：ア　、教授：ア　など
                // カ行の選択肢も対応: カ、キ、ク、ケ、コ
                // 数字の選択肢も対応: 1、2、3、4、5（半角）、１、２、３、４、５（全角）
                // 番号付き選択肢も対応: ①、②、③、④、⑤、⑥、⑦、⑧、⑨、⑩
                const choiceMatch = line.match(/^(ア|イ|ウ|エ|オ|カ|キ|ク|ケ|コ|[1-5]|[１-５]|[①②③④⑤⑥⑦⑧⑨⑩])　/) || 
                                   line.match(/[：；](ア|イ|ウ|エ|オ|カ|キ|ク|ケ|コ)　/);
                
                // 括弧付きアンダーライン部分を個別にマーキング可能にする
                const hasUnderlineChoices = line.match(/（(ア|イ|ウ|エ|オ|カ|キ|ク|ケ|コ)）<u>/);
                
                if (choiceMatch) {
                  const choice = choiceMatch[1] || choiceMatch[2];
                  const choiceStyle = getChoiceStyle(choice);
                  // 対話形式の選択肢かどうかを判定
                  const isDialogChoice = line.match(/^(教授|学生|調査士|補助者|先生|生徒)[：；]/);
                  const indentClass = isDialogChoice ? "ml-12 -indent-12" : "ml-6 -indent-6";
                  
                  return (
                    <div 
                      key={index} 
                      className={`${indentClass} mb-3 cursor-pointer transition-all duration-200 hover:bg-gray-100 p-2 rounded relative ${choiceStyle.textClass}`}
                      onClick={() => !showResult && toggleChoiceState(choice)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: line }} />
                      {choiceStyle.overlay}
                    </div>
                  );
                } else if (hasUnderlineChoices) {
                  return (
                    <div 
                      key={index} 
                      className="mb-3"
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  );
                } else if (line.match(/^(教授|学生|調査士|補助者|先生|生徒)[：；]/) && !line.match(/[：；](ア|イ|ウ|エ|オ|カ|キ|ク|ケ|コ)　/)) {
                  return (
                    <div 
                      key={index} 
                      className="ml-12 -indent-12 mb-3 p-2"
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  );
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return (
                    <div 
                      key={index}
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  );
                }
              })}
            </div>
          </div>

          {/* 画像表示エリア */}
          {hasImage && (
            <div className="mb-8 text-center">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <Image
                  src={`/images/${getImageFileName(question)}.png`}
                  alt={`${question.title}の図`}
                  width={600}
                  height={400}
                  className="mx-auto max-w-full h-auto"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* 表表示エリア */}
          {hasTable && (
            <div className="mb-8">
              {renderTable(question.id)}
            </div>
          )}

          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                  showResult
                    ? index === question.correctAnswer
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
                    onChange={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                    className="mt-1 mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                  {showResult && index === question.correctAnswer && (
                    <span className="ml-auto text-green-600 font-medium">✓ 正解</span>
                  )}
                  {showResult && index === selectedAnswer && !isCorrect && (
                    <span className="ml-auto text-red-600 font-medium">✗ 不正解</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {!showResult ? (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                回答する
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`text-xl font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '🎉 正解です！' : '❌ 不正解です'}
                </h3>
                <p className="text-gray-700">
                  正解：{question.options[question.correctAnswer]}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={resetQuestion}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  もう一度
                </button>
                {nextQuestion ? (
                  <Link
                    href={getNextQuestionUrl()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    次の問題
                  </Link>
                ) : (
                  <Link
                    href={getBackUrl()}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    {getBackButtonText().replace('← ', '')}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}