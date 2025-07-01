const fs = require('fs');
const path = require('path');

// Year conversion mapping
const yearMapping = {
  '平成17年': 2005, '平成18年': 2006, '平成19年': 2007, '平成20年': 2008, '平成21年': 2009,
  '平成22年': 2010, '平成23年': 2011, '平成24年': 2012, '平成25年': 2013, '平成26年': 2014,
  '平成27年': 2015, '平成28年': 2016, '平成29年': 2017, '平成30年': 2018,
  '令和1年': 2019, '令和2年': 2020, '令和3年': 2021, '令和4年': 2022, '令和5年': 2023, '令和6年': 2024
};

// Difficulty mapping  
const difficultyMapping = {
  '基本': 'easy',
  '標準': 'medium', 
  '応用': 'hard'
};

// Category standardization
const categoryMapping = {
  '民法': '民法',
  '民法（不動産登記法）': '民法',
  '民法（不動産物権変動）': '民法', 
  '民法（法律行為）': '民法',
  '民法（建物の滅失の登記）': '民法',
  '不動産登記法': '不動産登記法',
  '不動産登記': '不動産登記法',
  '不動産登記法（対話）': '不動産登記法',
  '不動産登記法（土地分筆）': '不動産登記法',
  '不動産登記法（筆界）': '不動産登記法',
  '不動産登記法（本件分合筆）': '不動産登記法',
  '不動産登記法（登記申請）': '不動産登記法',
  '不動産登記法（電子申請）': '不動産登記法',
  '不動産登記法（書面申請）': '不動産登記法',
  '不動産登記法（筆界特定制度）': '不動産登記法',
  '不動産登記法（分筆・添付情報）': '不動産登記法',
  '不動産登記法（区分建物表示）': '不動産登記法',
  '不動産登記法（建物合体登記）': '不動産登記法',
  '不動産登記法（登記可能建物）': '不動産登記法',
  '不動産登記法（床面積）': '不動産登記法',
  '不動産登記法（建物合併登記）': '不動産登記法',
  '不動産登記法（区分建物敷地権）': '不動産登記法',
  '建物登記': '不動産登記法',
  '区分建物登記': '不動産登記法',
  '建物合体登記': '不動産登記法',
  '建物表示登記': '不動産登記法',
  '表題部所有者': '不動産登記法',
  '筆界特定制度': '不動産登記法',
  '土地合筆': '不動産登記法',
  '登記所管轄': '不動産登記法',
  '分筆登記': '不動産登記法',
  '地目変更登記': '不動産登記法',
  '登記申請': '不動産登記法',
  '登記識別情報': '不動産登記法',
  '建物滅失登記': '不動産登記法',
  '登記対象建物': '不動産登記法',
  '土地家屋調査士法': '土地家屋調査士法',
  '土地家屋調査士': '土地家屋調査士法',
  '土地家屋調査士法（懲戒処分）': '土地家屋調査士法',
  '法律行為': '民法',
  '占有訴権': '民法'
};

function cleanTitle(title) {
  // Remove "について" suffix and other cleanup
  return title
    .replace(/について$/, '')
    .replace(/に関する$/, '')
    .trim();
}

function processQuestion(question, fileYear) {
  const processedQuestion = {
    id: question.id,
    year: yearMapping[question.year] || parseInt(fileYear),
    category: categoryMapping[question.category] || question.category,
    questionNumber: question.questionNumber,
    title: question.title ? cleanTitle(question.title) : `問題${question.questionNumber}`,
    content: question.question || question.content,
    options: question.choices || question.options,
    correctAnswer: Array.isArray(question.correctAnswer) ? question.correctAnswer[0] - 1 : 
                   (typeof question.correctAnswer === 'number' ? question.correctAnswer - 1 : 0),
    explanation: question.explanation || '',
    difficulty: difficultyMapping[question.difficulty] || 'medium'
  };

  // Ensure correctAnswer is 0-indexed
  if (processedQuestion.correctAnswer < 0) {
    processedQuestion.correctAnswer = 0;
  }

  return processedQuestion;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      console.error(`Invalid structure in ${filePath}`);
      return [];
    }

    const fileName = path.basename(filePath, '.json');
    const fileYear = fileName.match(/[hr](\d+)/)?.[1];
    
    return data.questions.map(q => processQuestion(q, fileYear));
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
}

function generateStatistics(questions) {
  const stats = {
    total: questions.length,
    byYear: {},
    byCategory: {},
    byDifficulty: {},
    dataQualityIssues: []
  };

  questions.forEach(q => {
    // Count by year
    stats.byYear[q.year] = (stats.byYear[q.year] || 0) + 1;
    
    // Count by category
    stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
    
    // Count by difficulty
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    
    // Check for quality issues
    if (!q.content || q.content.length < 10) {
      stats.dataQualityIssues.push(`${q.id}: Missing or short content`);
    }
    if (!q.options || q.options.length !== 5) {
      stats.dataQualityIssues.push(`${q.id}: Invalid options count (${q.options?.length || 0})`);
    }
    if (q.correctAnswer < 0 || q.correctAnswer > 4) {
      stats.dataQualityIssues.push(`${q.id}: Invalid correctAnswer (${q.correctAnswer})`);
    }
  });

  return stats;
}

function main() {
  const tmpDir = '/Users/mandokorokoumei/sample/surveyor-exam-app/src/data/tmp';
  const outputPath = '/Users/mandokorokoumei/sample/surveyor-exam-app/src/data/questions.ts';
  
  // Get all JSON files
  const files = fs.readdirSync(tmpDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => path.join(tmpDir, file));

  console.log(`Processing ${files.length} files...`);

  // Process all files
  let allQuestions = [];
  files.forEach(file => {
    const questions = processFile(file);
    allQuestions = allQuestions.concat(questions);
    console.log(`Processed ${path.basename(file)}: ${questions.length} questions`);
  });

  // Generate statistics
  const stats = generateStatistics(allQuestions);
  
  // Create TypeScript file content
  const tsContent = `import { Question } from '@/types';

export const sampleQuestions: Question[] = ${JSON.stringify(allQuestions, null, 2)};
`;

  // Write the consolidated file
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  
  // Display statistics
  console.log('\n=== CONSOLIDATION SUMMARY ===');
  console.log(`Total questions processed: ${stats.total}`);
  console.log('\nQuestions by year:');
  Object.entries(stats.byYear).sort().forEach(([year, count]) => {
    console.log(`  ${year}: ${count} questions`);
  });
  
  console.log('\nQuestions by category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} questions`);
  });
  
  console.log('\nQuestions by difficulty:');
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} questions`);
  });
  
  if (stats.dataQualityIssues.length > 0) {
    console.log('\nData quality issues found:');
    stats.dataQualityIssues.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue}`);
    });
    if (stats.dataQualityIssues.length > 10) {
      console.log(`  ... and ${stats.dataQualityIssues.length - 10} more issues`);
    }
  } else {
    console.log('\nNo data quality issues found!');
  }
  
  console.log(`\nConsolidated file written to: ${outputPath}`);
}

main();