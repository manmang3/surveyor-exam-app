// TypeScriptファイルをテストするためのスクリプト
const fs = require('fs');

// questions.tsを直接読み込んで評価
const content = fs.readFileSync('./src/data/questions.ts', 'utf8');

// TypeScriptの型定義とimport文を削除
const cleanContent = content
  .replace(/import.*from.*;/g, '')
  .replace(/export\s+/g, '')
  .replace(/:\s*Question\[\]/g, '');

// sampleQuestions変数を評価
eval(cleanContent);

// メインカテゴリの構造
const mainCategories = {
  '民法': ['代理', '物権', '債権', '相続'],
  '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
  '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
};

console.log('=== Next.jsアプリと同じロジックでテスト ===');

Object.entries(mainCategories).forEach(([mainCategory, subCategories]) => {
  const count = sampleQuestions.filter(q => {
    return subCategories.includes(q.category);
  }).length;
  
  console.log(`${mainCategory}: ${count}問`);
  
  if (count === 0) {
    console.log(`  問題: ${mainCategory}で0問が検出されました`);
    console.log(`  期待するサブカテゴリ:`, subCategories);
    
    // 実際に存在するカテゴリを確認
    const existingCategories = [...new Set(sampleQuestions.map(q => q.category))];
    const matchingCategories = existingCategories.filter(cat => 
      subCategories.some(sub => cat.includes(sub) || sub.includes(cat))
    );
    console.log(`  類似カテゴリ:`, matchingCategories);
  }
});

console.log('\n=== 実際のカテゴリ一覧 ===');
const allCategories = [...new Set(sampleQuestions.map(q => q.category))];
allCategories.forEach(cat => {
  const count = sampleQuestions.filter(q => q.category === cat).length;
  console.log(`${cat}: ${count}問`);
});