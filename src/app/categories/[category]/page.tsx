'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sampleQuestions } from '@/data/questions';

export default function CategoryPage() {
  const params = useParams();
  const category = decodeURIComponent(params.category as string);

  // メインカテゴリとサブカテゴリの構造
  const mainCategories = {
    '民法': ['代理', '物権', '債権', '相続'],
    '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
    '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
  };

  const subCategories = mainCategories[category as keyof typeof mainCategories] || [];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category}</h1>
          <p className="text-gray-600">サブカテゴリを選択してください</p>
        </div>

        <div className="grid gap-4 max-w-2xl">
          {category === '不動産登記法' ? (
            // 不動産登記法の場合はサブカテゴリを表示
            ['総論', '土地', '建物', '区分建物', '表題部所有者'].map(subCategory => {
              const count = sampleQuestions.filter(q => q.category === category && q.subcategory === subCategory).length;
              
              return (
                <Link
                  key={subCategory}
                  href={`/questions?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subCategory)}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">{subCategory}</span>
                    <span className="text-gray-500">{count}問</span>
                  </div>
                </Link>
              );
            })
          ) : (
            // その他のカテゴリは従来通り
            subCategories.map(subCategory => {
              const count = sampleQuestions.filter(q => q.category === subCategory).length;
              
              return (
                <Link
                  key={subCategory}
                  href={`/questions?category=${encodeURIComponent(subCategory)}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">{subCategory}</span>
                    <span className="text-gray-500">{count}問</span>
                  </div>
                </Link>
              );
            })
          )}
          
          {/* すべての問題を見るリンク */}
          <Link
            href={category === '不動産登記法' 
              ? `/questions?category=${encodeURIComponent(category)}`
              : `/questions?maincategory=${encodeURIComponent(category)}`
            }
            className="block p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{category} すべての問題</span>
              <span className="text-blue-100">
                {category === '不動産登記法'
                  ? sampleQuestions.filter(q => q.category === category).length
                  : sampleQuestions.filter(q => {
                      return subCategories.includes(q.category);
                    }).length
                }問
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}