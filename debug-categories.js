// デバッグ用スクリプト
const fs = require('fs');

// questions.tsファイルを読み込み
const content = fs.readFileSync('./src/data/questions.ts', 'utf8');
const questionsMatch = content.match(/export const sampleQuestions: Question\[\] = \[(.*)\];/s);

if (questionsMatch) {
  const questionsData = questionsMatch[1];
  const questions = eval('[' + questionsData + ']');
  
  console.log('=== 総合統計 ===');
  console.log('総問題数:', questions.length);
  
  const mainCategories = {
    '民法': ['代理', '物権', '債権', '相続'],
    '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
    '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
  };
  
  console.log('\n=== メインカテゴリ別問題数 ===');
  Object.entries(mainCategories).forEach(([mainCategory, subCategories]) => {
    const totalCount = questions.filter(q => subCategories.includes(q.category)).length;
    console.log(`${mainCategory}: ${totalCount}問`);
    
    console.log('  サブカテゴリ:');
    subCategories.forEach(subCategory => {
      const count = questions.filter(q => q.category === subCategory).length;
      console.log(`    ${subCategory}: ${count}問`);
    });
    console.log('');
  });
  
  // 不動産登記法のサンプル問題を表示
  console.log('=== 不動産登記法のサンプル問題 ===');
  const realEstateQuestions = questions.filter(q => 
    ['総論', '土地', '建物', '区分建物', '表題部所有者'].includes(q.category)
  ).slice(0, 10);
  
  realEstateQuestions.forEach(q => {
    console.log(`${q.id} - 問${q.questionNumber} - ${q.category} - ${q.year}年`);
  });
}