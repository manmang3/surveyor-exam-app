import { sampleQuestions } from '@/data/questions';

// デバッグ情報を出力
console.log('=== デバッグ情報 ===');
console.log('総問題数:', sampleQuestions.length);

const mainCategories = {
  '民法': ['代理', '物権', '債権', '相続'],
  '不動産登記法': ['総論', '土地', '建物', '区分建物', '表題部所有者'],
  '土地家屋調査士法': ['土地家屋調査士の義務', '土地家屋調査士会', '懲戒処分']
};

Object.entries(mainCategories).forEach(([mainCategory, subCategories]) => {
  const count = sampleQuestions.filter(q => {
    return subCategories.includes(q.category);
  }).length;
  console.log(`${mainCategory}: ${count}問`);
});

export default function DebugPage() {
  return <div>Debug Page</div>;
}