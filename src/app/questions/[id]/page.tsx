'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { sampleQuestions } from '@/data/questions';
import { Question } from '@/types';
import { LearningStorage } from '@/lib/storage';


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
  const [startTime, setStartTime] = useState<number>(Date.now());

  const findNextQuestion = useCallback((currentQuestion: Question): Question | null => {
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    // サブカテゴリ別の小分類順序マッピング（questions/page.tsxと同じ定義）
    const detailCategoryOrderBySubcategory = {
      // 民法
      "総則": {
        "未成年": 0, "行為能力": 1, "権利能力なき社団": 2, "意思表示": 3, "瑕疵ある意思表示": 4,
        "代理": 5, "無権代理と相続": 6, "無効と取り消し": 7, "条件": 8,
      },
      "物権": {
        "取得時効": 0, "時効の援用": 1, "時効の更新": 2, "不動産": 3, "物件変動": 4,
        "不動産の物権変動": 5, "取得時効と登記": 6, "相続と登記": 7, "物件的請求権": 8, "占有権": 9,
        "占有訴権": 10, "袋地所有者の囲繞地通行権": 11, "囲繞地通行権": 12, "相隣関係": 13, "共有": 14,
        "地上権": 15, "質権": 16, "付合": 17,
      },
      "相続": {
        "相続": 0, "相続人": 1, "相続の承認・放棄": 2, "遺産分割": 3, "遺言": 4, "代襲相続": 5,
      },
      // 不動産登記法
      "総論": {
        "不動産登記制度": 0, "報告的登記と形式的登記": 1, "登記制度の変遷": 2, "申請義務": 3, "申請人適格": 4,
        "相続人その他の一般承継人": 5, "代位による登記": 6, "登記所の管轄": 7, "登記所における各情報の保存期間": 8,
        "実地調査": 9, "本人確認調査": 10, "登記記録": 11, "一不動産一登記記録主義": 12, "土地区画整理事業と登記記録": 13,
        "地図及び建物所在図": 14, "地図": 15, "地図に準ずる図面": 16, "地図の訂正": 17, "登記情報の公開": 18,
        "申請情報": 19, "添付情報": 20, "所有権証明書": 21, "法定相続情報一覧図": 22, "登録免許税": 23,
        "登記識別情報": 24, "登記識別情報（登記済証）": 25, "登記識別情報に関する証明": 26, "代理権の不消滅": 27,
        "代理人": 28, "特別の委任": 29, "一の申請情報による登記の申請": 30, "電子申請": 31, "原本還付": 32,
        "事前通知と本人確認情報": 33, "本人確認情報": 34, "登記識別情報の通知": 35, "登記完了証": 36,
        "登記完了証の通知": 37, "却下": 38, "却下、取下げ": 39, "取下げ": 40, "審査請求": 41,
        "筆界特定の流れ": 42, "筆界特定": 43,
      },
      "表題部所有者": {
        "表題部所有者に関する登記": 0,
      },
      "土地": {
        "土地に関する登記": 0, "地番": 1, "地番・家屋番号": 2, "地目": 3, "地積": 4, "土地の境界": 5,
        "土地の登記申請における添付図面": 6, "土地所在図": 7, "地積測量図": 8, "地役権図面": 9,
        "添付図面の訂正の申出": 10, "土地の表題登記": 11, "土地の表題部の変更または更正登記": 12,
        "土地分筆登記": 13, "土地合筆登記": 14, "土地合筆登記の制限": 15, "土地分合筆登記": 16,
        "土地の滅失登記": 17,
      },
      "建物": {
        "建物に関する登記": 0, "建物の表示に関する登記事項": 1, "申請義務": 2, "所在": 3, "家屋番号": 4,
        "建物の認定": 5, "種類": 6, "構造": 7, "構造と床面積": 8, "床面積": 9, "建物の個数": 10,
        "附属建物": 11, "申請情報": 12, "建物の登記申請における添付図面": 13, "建物の表題登記": 14,
        "建物の表題登記の意義": 15, "建物の表題部の変更または更正登記": 16, "建物分割登記": 17,
        "建物合併登記": 18, "建物合併登記の制限": 19, "建物の分割または合併の登記": 20,
        "建物の合体による登記等": 21, "建物の滅失登記": 22,
      },
      "区分建物": {
        "登記記録": 0, "区分建物に関する登記": 1, "規約": 2, "敷地権": 3, "申請情報": 4,
        "区分建物の表題登記": 5, "区分建物の表題部の変更または更正登記": 6,
        "共用部分または団地共用部分に関する登記": 7,
      },
      // 土地家屋調査士法
      "調査士法": {
        "登録・移転・取消し": 0, "業務に関する法規": 1, "業務制限": 2, "調査士法人": 3,
        "欠格事由": 4, "懲戒処分": 5, "調査士会": 6,
      }
    };
    
    if (year) {
      // 年度別での次の問題を探す
      const yearQuestions = sampleQuestions
        .filter(q => q.year === parseInt(year))
        .sort((a, b) => a.questionNumber - b.questionNumber);
      
      const currentIndex = yearQuestions.findIndex(q => q.id === currentQuestion.id);
      return currentIndex < yearQuestions.length - 1 ? yearQuestions[currentIndex + 1] : null;
    }
    
    if (category) {
      // 分野別での次の問題を探す - 小分類順でソート
      let filteredQuestions = sampleQuestions.filter(q => q.category === category);
      
      if (subcategory) {
        // サブカテゴリがある場合（不動産登記法・土地家屋調査士法）
        filteredQuestions = filteredQuestions.filter(q => q.subcategory === subcategory);
      }
      
      // 分野別のソート順（小分類順 → 年度順）
      filteredQuestions.sort((a, b) => {
        const aSubCategory = a.subcategory || '';
        const bSubCategory = b.subcategory || '';
        const aDetailCategory = a.detailCategory || '';
        const bDetailCategory = b.detailCategory || '';
        
        // サブカテゴリが異なる場合は、まずサブカテゴリでソート
        if (aSubCategory !== bSubCategory) {
          // サブカテゴリの順序（不動産登記法の場合）
          const subcategoryOrder = ['総論', '表題部所有者', '土地', '建物', '区分建物'];
          const aSubOrder = subcategoryOrder.indexOf(aSubCategory);
          const bSubOrder = subcategoryOrder.indexOf(bSubCategory);
          
          if (aSubOrder !== -1 && bSubOrder !== -1) {
            return aSubOrder - bSubOrder;
          }
          
          // 民法・土地家屋調査士法など他のカテゴリの場合は文字列順
          return aSubCategory.localeCompare(bSubCategory, 'ja');
        }
        
        // 同じサブカテゴリ内での小分類順でソート
        const subcategoryDetailOrder = (detailCategoryOrderBySubcategory as Record<string, Record<string, number>>)[aSubCategory] || {};
        const aOrder = aDetailCategory ? (subcategoryDetailOrder[aDetailCategory] ?? 9999) : 9999;
        const bOrder = bDetailCategory ? (subcategoryDetailOrder[bDetailCategory] ?? 9999) : 9999;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // 同じ小分類内では年度順でソート
        return a.year - b.year;
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
    setStartTime(Date.now()); // 新しい問題の開始時間をリセット
    
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
      const tableQuestions = ['h19_15', 'h25_07', 'h26_04', 'h29_13', 'r2_19'];
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
            <Image 
              src="/tables/h25-7.png" 
              alt="問題7の表"
              width={600}
              height={400}
              className="mx-auto border border-gray-300 rounded"
            />
          </div>
        );

      case 'h26_04':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">A</td>
                  <td className="border border-gray-300 px-3 py-2">登記簿</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">B</td>
                  <td className="border border-gray-300 px-3 py-2">不動産登記</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">C</td>
                  <td className="border border-gray-300 px-3 py-2">土地台帳・家屋台帳</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">D</td>
                  <td className="border border-gray-300 px-3 py-2">市町村</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">E</td>
                  <td className="border border-gray-300 px-3 py-2">国</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">F</td>
                  <td className="border border-gray-300 px-3 py-2">都道府県</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">G</td>
                  <td className="border border-gray-300 px-3 py-2">用益物権の設定</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">H</td>
                  <td className="border border-gray-300 px-3 py-2">所有権の保存</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">I</td>
                  <td className="border border-gray-300 px-3 py-2">所有権の移転</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">J</td>
                  <td className="border border-gray-300 px-3 py-2">申請適格者</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">K</td>
                  <td className="border border-gray-300 px-3 py-2">申請代理人</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">L</td>
                  <td className="border border-gray-300 px-3 py-2">納税義務者</td>
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

      case 'h26_04':
        return (
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">A</td>
                  <td className="border border-gray-300 px-3 py-2">登記簿</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">B</td>
                  <td className="border border-gray-300 px-3 py-2">不動産登記</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">C</td>
                  <td className="border border-gray-300 px-3 py-2">土地台帳・家屋台帳</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">D</td>
                  <td className="border border-gray-300 px-3 py-2">市町村</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">E</td>
                  <td className="border border-gray-300 px-3 py-2">国</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">F</td>
                  <td className="border border-gray-300 px-3 py-2">都道府県</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">G</td>
                  <td className="border border-gray-300 px-3 py-2">用益物権の設定</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">H</td>
                  <td className="border border-gray-300 px-3 py-2">所有権の保存</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">I</td>
                  <td className="border border-gray-300 px-3 py-2">所有権の移転</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">J</td>
                  <td className="border border-gray-300 px-3 py-2">申請適格者</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">K</td>
                  <td className="border border-gray-300 px-3 py-2">申請代理人</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">L</td>
                  <td className="border border-gray-300 px-3 py-2">納税義務者</td>
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
    if (selectedAnswer !== null && question) {
      setShowResult(true);
      
      // 学習履歴を記録
      const answerTime = Math.floor((Date.now() - startTime) / 1000); // 秒単位
      const isCorrect = selectedAnswer === question.correctAnswer;
      const sessionType = searchParams.get('examMode') ? 'exam' : 'individual';
      
      LearningStorage.saveAnswer(question.id, {
        answeredAt: new Date().toISOString(),
        isCorrect,
        answerTime,
        userAnswer: selectedAnswer,
        sessionType: sessionType as 'individual' | 'exam'
      });
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setChoiceStates(new Map());
    setStartTime(Date.now()); // 開始時間をリセット
  };

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
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {toJapaneseYear(question.year)} 第{question.questionNumber}問
                </span>
              </div>
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