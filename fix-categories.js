const fs = require('fs');
const path = require('path');

// サブカテゴリ分類マッピング
const subcategoryMapping = {
  // 土地
  '土地': [
    'h23-8', 'h27-6', 'h29-13', 'h30-8', 'h23-7', 'h27-8', 'r3-9', 'h17-16', 'h18-7', 'h21-5',
    'h22-12', 'h25-8', 'h30-9', 'r1-5', 'r2-6', 'r3-10', 'r4-6', 'r5-8', 'h20-6', 'h20-7',
    'h20-11', 'h28-11', 'h17-17', 'h18-9', 'r1-7', 'h24-9', 'h17-5', 'h27-7', 'r5-7', 'h17-15',
    'h19-13', 'h21-7', 'h22-11', 'h24-6', 'h26-9', 'h28-8', 'r2-7', 'r2-8', 'r4-7', 'h17-6',
    'h18-14', 'h19-12', 'h20-13', 'h22-18', 'h23-6', 'h24-7', 'h25-9', 'h26-10', 'h28-9',
    'r2-9', 'r3-11', 'r4-8', 'r5-9', 'h27-9', 'h28-10', 'h29-14', 'r2-10', 'r4-9', 'h18-13',
    'h19-10', 'h22-4', 'h24-8', 'h20-8', 'r1-6', 'r6-7', 'r6-8', 'r6-9', 'r6-10'
  ],
  
  // 表題部所有者
  '表題部所有者': [
    'h21-8', 'h23-12', 'h27-5', 'h29-11', 'r3-8'
  ],
  
  // 区分建物
  '区分建物': [
    'r2-15', 'h18-5', 'h19-5', 'h21-19', 'h22-15', 'h26-16', 'h27-15', 'h28-16',
    'h29-17', 'h30-11', 'r1-18', 'r4-17', 'h24-18', 'h18-19', 'h20-19', 'h27-16',
    'r2-14', 'r4-18', 'h17-10', 'h20-14', 'h23-19', 'h25-16', 'h17-19', 'h22-6',
    'h27-17', 'h30-16', 'r3-18', 'r5-17', 'r6-18'
  ],
  
  // 建物
  '建物': [
    'h18-11', 'h21-10', 'h30-12', 'r1-13', 'r1-16', 'r3-12', 'h25-12', 'h28-12', 'h24-13',
    'h25-10', 'r2-11', 'h25-11', 'r4-11', 'h21-4', 'h30-10', 'r4-10', 'r5-11', 'r3-14',
    'h29-16', 'r2-12', 'h17-4', 'h19-4', 'h20-17', 'h21-17', 'h25-13', 'h26-15', 'h30-13',
    'r4-12', 'r5-12', 'r1-9', 'h17-8', 'h18-6', 'h23-17', 'h26-14', 'h30-14', 'r2-13',
    'r4-14', 'h25-14', 'h19-7', 'h23-15', 'h24-17', 'h26-13', 'h28-17', 'r1-10', 'r3-13',
    'r5-10', 'h18-4', 'h27-14', 'r4-13', 'r5-13', 'h17-14', 'h19-19', 'h20-16', 'h24-16',
    'h27-13', 'h20-5', 'h22-13', 'h26-11', 'r3-15', 'h24-14', 'h28-13', 'h30-15', 'r5-15',
    'h21-11', 'h22-5', 'h28-14', 'r4-16', 'h17-12', 'h18-12', 'h20-18', 'h25-17', 'r1-12',
    'r3-16', 'h18-18', 'h19-6', 'h20-15', 'h21-18', 'h23-18', 'h26-17', 'h28-15', 'r2-16',
    'r4-15', 'r5-16', 'h19-18', 'h20-4', 'h23-13', 'h29-18', 'r2-17', 'r3-17', 'r6-12',
    'r6-13', 'r6-14', 'r6-15', 'r6-16', 'r6-17'
  ]
};

// 問題IDからサブカテゴリを取得する関数
function getSubcategory(questionId) {
  for (const [subcategory, ids] of Object.entries(subcategoryMapping)) {
    if (ids.includes(questionId)) {
      return subcategory;
    }
  }
  return '総論'; // デフォルトは総論
}

// 年度と問題番号から問題IDを生成する関数
function generateMappingId(year, questionNumber) {
  // 年度を変換（例: 2005 -> h17）
  let yearStr;
  if (year >= 1989 && year <= 2018) {
    yearStr = `h${year - 1988}`;
  } else if (year >= 2019) {
    yearStr = `r${year - 2018}`;
  } else {
    yearStr = year.toString();
  }
  
  return `${yearStr}-${questionNumber}`;
}

// 修正処理を実行
async function fixCategories() {
  const questionsPath = path.join(__dirname, 'src', 'data', 'questions.ts');
  let content = fs.readFileSync(questionsPath, 'utf8');
  
  console.log('不動産登記法の問題を修正中...');
  
  // 既存のサブカテゴリ（土地、建物、区分建物、表題部所有者、総論）の問題を
  // 不動産登記法カテゴリに統一し、サブカテゴリを追加
  const targetCategories = ['土地', '建物', '区分建物', '表題部所有者', '総論'];
  
  // 各問題を処理
  content = content.replace(
    /"id":\s*"([^"]+)",\s*\n\s*"year":\s*(\d+),\s*\n\s*"category":\s*"([^"]+)",/g,
    (match, id, year, category) => {
      if (targetCategories.includes(category)) {
        const yearNum = parseInt(year);
        const questionNum = parseInt(id.split('_')[1]);
        const mappingId = generateMappingId(yearNum, questionNum);
        const subcategory = getSubcategory(mappingId);
        
        return `"id": "${id}",\n    "year": ${year},\n    "category": "不動産登記法",\n    "subcategory": "${subcategory}",`;
      }
      return match;
    }
  );
  
  fs.writeFileSync(questionsPath, content);
  console.log('不動産登記法の問題修正が完了しました。');
  
  // 修正結果を確認
  const updatedContent = fs.readFileSync(questionsPath, 'utf8');
  const realEstateCount = (updatedContent.match(/"category":\s*"不動産登記法"/g) || []).length;
  console.log(`修正後の不動産登記法問題数: ${realEstateCount}問`);
}

fixCategories().catch(console.error);