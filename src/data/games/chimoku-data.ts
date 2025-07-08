// 地目ランゲーム用データ

export interface ChimokuQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const chimokuQuestions: ChimokuQuestion[] = [
  {
    id: 'chimoku_001',
    question: '住宅や店舗が建っている土地の地目は？',
    correctAnswer: '宅地',
    wrongAnswer: '雑種地',
    explanation: '建物の敷地及びその維持もしくは効用を果たすために必要な土地は宅地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_002', 
    question: '稲、麦、野菜などを栽培する土地の地目は？',
    correctAnswer: '田',
    wrongAnswer: '畑',
    explanation: '用水を利用して耕作する土地は田です。畑は用水を利用しないで耕作する土地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_003',
    question: '桑、茶、果樹などを栽培する土地の地目は？',
    correctAnswer: '畑',
    wrongAnswer: '山林',
    explanation: '用水を利用しないで耕作する土地は畑です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_004',
    question: '竹木の生育する土地の地目は？',
    correctAnswer: '山林',
    wrongAnswer: '原野',
    explanation: '竹木の生育する土地は山林です。原野は耕作の方法によらないで雑草、灌木類の生育する土地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_005',
    question: '学校が建っている土地の地目は？',
    correctAnswer: '学校用地',
    wrongAnswer: '宅地',
    explanation: '学校の敷地は学校用地です。公立私立を問いません。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_006',
    question: '鉄道の線路敷として使用されている土地の地目は？',
    correctAnswer: '鉄道用地',
    wrongAnswer: '雑種地',
    explanation: '鉄道の線路敷として使用される土地は鉄道用地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_007',
    question: '公園として使用されている土地の地目は？',
    correctAnswer: '公園',
    wrongAnswer: '雑種地',
    explanation: '公園法による公園及び公園に類似する土地は公園です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_008',
    question: '墓石が設置されている土地の地目は？',
    correctAnswer: '墓地',
    wrongAnswer: '境内地',
    explanation: '人の遺体または遺骨を埋葬する土地は墓地です。境内地は神社や寺院の境内である土地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_009',
    question: '神社の境内として使用されている土地の地目は？',
    correctAnswer: '境内地',
    wrongAnswer: '宅地',
    explanation: '神社、寺院、教会等の建物及びその維持に必要な土地は境内地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_010',
    question: '牛や馬を放牧している土地の地目は？',
    correctAnswer: '牧場',
    wrongAnswer: '原野',
    explanation: '家畜を放牧し、または飼料を栽培する土地は牧場です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_011',
    question: '塩を製造するために使用されている土地の地目は？',
    correctAnswer: '塩田',
    wrongAnswer: '雑種地',
    explanation: '海水を引き入れて塩を採取する土地は塩田です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_012',
    question: '一般通行の用に供されている道路の地目は？',
    correctAnswer: '公衆用道路',
    wrongAnswer: '雑種地',
    explanation: '一般交通の用に供する道路は公衆用道路です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_013',
    question: '耕作の方法によらないで雑草や灌木類が生育する土地の地目は？',
    correctAnswer: '原野',
    wrongAnswer: '山林',
    explanation: '耕作の方法によらないで雑草、灌木類の生育する土地は原野です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_014',
    question: '水道の供給のために使用されている土地の地目は？',
    correctAnswer: '水道用地',
    wrongAnswer: '雑種地',
    explanation: '専ら給水の目的で敷設する水道の敷地は水道用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_015',
    question: '農業用水路として使用されている土地の地目は？',
    correctAnswer: '用悪水路',
    wrongAnswer: '雑種地',
    explanation: '灌漑用水路、悪水路その他の水路である土地は用悪水路です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_016',
    question: '耕地灌漑用の用水貯留池の地目は？',
    correctAnswer: 'ため池',
    wrongAnswer: '池沼',
    explanation: '耕地灌漑用の用水貯留池はため池です。池沼は灌漑用水でない水の貯留池です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_017',
    question: '防水のために築造した土地の地目は？',
    correctAnswer: '堤',
    wrongAnswer: '雑種地',
    explanation: '防水のために築造した土地は堤です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_018',
    question: '田畝または村落の境界にある土地の地目は？',
    correctAnswer: '井溝',
    wrongAnswer: '用悪水路',
    explanation: '田畝または村落の境界にある土地は井溝です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_019',
    question: '森林法による保安林である土地の地目は？',
    correctAnswer: '保安林',
    wrongAnswer: '山林',
    explanation: '森林法による保安林である土地は保安林です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_020',
    question: '鉱泉（温泉を含む）の湧出口及びその維持に必要な土地の地目は？',
    correctAnswer: '鉱泉地',
    wrongAnswer: '雑種地',
    explanation: '鉱泉（温泉を含む）の湧出口及びその維持に必要な土地は鉱泉地です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_021',
    question: '灌漑用水でない水の貯留池の地目は？',
    correctAnswer: '池沼',
    wrongAnswer: 'ため池',
    explanation: '灌漑用水でない水の貯留池は池沼です。ため池は耕地灌漑用の用水貯留池です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_022',
    question: '運河法による運河である土地の地目は？',
    correctAnswer: '運河用地',
    wrongAnswer: '用悪水路',
    explanation: '運河法による運河である土地は運河用地です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_023',
    question: '以上のいずれにも該当しない土地の地目は？',
    correctAnswer: '雑種地',
    wrongAnswer: '原野',
    explanation: '田、畑、宅地等のいずれにも該当しない土地は雑種地です。',
    difficulty: 'easy'
  }
];

// 宅地vs雑種地の専用問題（28問中の最後5問用）
export const takuchiVsZasshuchiQuestions: ChimokuQuestion[] = [
  {
    id: 'takuchi_vs_01',
    question: '住宅の敷地として使用されている土地の地目は？',
    correctAnswer: '宅地',
    wrongAnswer: '雑種地',
    explanation: '建物の敷地及びその維持もしくは効用を果たすために必要な土地は宅地です。',
    difficulty: 'medium'
  },
  {
    id: 'takuchi_vs_02', 
    question: '青空駐車場として使用されている土地の地目は？',
    correctAnswer: '雑種地',
    wrongAnswer: '宅地',
    explanation: '建物が建っておらず、駐車場として使用されている土地は雑種地です。',
    difficulty: 'medium'
  },
  {
    id: 'takuchi_vs_03',
    question: '工場の敷地として使用されている土地の地目は？',
    correctAnswer: '宅地',
    wrongAnswer: '雑種地',
    explanation: '工場等の建物の敷地として使用されている土地は宅地です。',
    difficulty: 'medium'
  },
  {
    id: 'takuchi_vs_04',
    question: '資材置場として使用されている土地の地目は？',
    correctAnswer: '雑種地',
    wrongAnswer: '宅地',
    explanation: '建物が建っていない資材置場は雑種地です。',
    difficulty: 'medium'
  },
  {
    id: 'takuchi_vs_05',
    question: '店舗兼住宅の敷地として使用されている土地の地目は？',
    correctAnswer: '宅地',
    wrongAnswer: '雑種地',
    explanation: '建物（店舗兼住宅）の敷地として使用されている土地は宅地です。',
    difficulty: 'medium'
  }
];

// 地目の基本情報
export const chimokuInfo = {
  '田': '用水を利用して耕作する土地',
  '畑': '用水を利用しないで耕作する土地', 
  '宅地': '建物の敷地及びその維持もしくは効用を果たすために必要な土地',
  '学校用地': '学校の敷地である土地',
  '鉄道用地': '鉄道の線路敷として使用される土地',
  '塩田': '海水を引き入れて塩を採取する土地',
  '鉱泉地': '鉱泉（温泉を含む）の湧出口及びその維持に必要な土地',
  '池沼': '灌漑用水でない水の貯留池',
  '山林': '竹木の生育する土地',
  '牧場': '家畜を放牧し、または飼料を栽培する土地',
  '原野': '耕作の方法によらないで雑草、灌木類の生育する土地',
  '墓地': '人の遺体または遺骨を埋葬する土地',
  '境内地': '神社、寺院、教会等の建物及びその維持に必要な土地',
  '運河用地': '運河法による運河である土地',
  '水道用地': '専ら給水の目的で敷設する水道の敷地',
  '用悪水路': '灌漑用水路、悪水路その他の水路である土地',
  'ため池': '耕地灌漑用の用水貯留池',
  '堤': '防水のために築造した土地',
  '井溝': '田畝または村落の境界にある土地',
  '保安林': '森林法による保安林である土地',
  '公衆用道路': '一般交通の用に供する道路',
  '公園': '公園法による公園及び公園に類似する土地',
  '雑種地': '以上のいずれにも該当しない土地'
};