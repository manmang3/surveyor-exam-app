// 地目ランゲーム用データ

export interface ChimokuQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswers?: string[]; // 指定された不正解肢（オプション）
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 23地目の完全なリスト
export const ALL_CHIMOKU = [
  '田', '畑', '宅地', '学校用地', '鉄道用地', '塩田', '鉱泉地', '池沼', 
  '山林', '牧場', '原野', '墓地', '境内地', '運河用地', '水道用地', 
  '用悪水路', 'ため池', '堤', '井溝', '保安林', '公衆用道路', '公園', '雑種地'
];

// 1-15問目（基本問題）
export const chimokuQuestions: ChimokuQuestion[] = [
  {
    id: 'chimoku_001',
    question: '農耕地で用水を利用して耕作する土地',
    correctAnswer: '田',
    wrongAnswers: ['畑'],
    explanation: '用水を利用して耕作する土地は田です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_002',
    question: '農耕地で用水を利用しないで耕作する土地',
    correctAnswer: '畑',
    wrongAnswers: ['田'],
    explanation: '用水を利用しないで耕作する土地は畑です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_003',
    question: 'ガスタンクや石油タンクの敷地',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: 'ガスタンクや石油タンクの敷地は宅地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_004',
    question: '工場や事務所、店舗などの敷地や物置小屋、倉庫などの敷地',
    correctAnswer: '宅地',
    wrongAnswers: [],
    explanation: '建物の敷地及びその維持もしくは効用を果たすために必要な土地は宅地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_005',
    question: '校舎、附属施設および運動場の土地の地目',
    correctAnswer: '学校用地',
    wrongAnswers: [],
    explanation: '学校の敷地は学校用地です。公立私立を問いません。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_006',
    question: '鉄道の駅舎、鉄道専用の変電所等の附属施設および路線の敷地の土地',
    correctAnswer: '鉄道用地',
    wrongAnswers: [],
    explanation: '鉄道の線路敷として使用される土地は鉄道用地です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_007',
    question: '鉄道のガード下を利用して築造された店舗の敷地',
    correctAnswer: '鉄道用地',
    wrongAnswers: ['宅地', '雑種地'],
    explanation: '鉄道のガード下を利用して築造された店舗の敷地は鉄道用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_008',
    question: '海水を引き入れて塩を採取する土地',
    correctAnswer: '塩田',
    wrongAnswers: ['運河用地', '水道用地'],
    explanation: '海水を引き入れて塩を採取する土地は塩田です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_009',
    question: '鉱泉のわき出し口およびその維持に必要な土地',
    correctAnswer: '鉱泉地',
    wrongAnswers: [],
    explanation: '鉱泉（温泉を含む）の湧出口及びその維持に必要な土地は鉱泉地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_010',
    question: 'かんがい用水でない水の貯留池',
    correctAnswer: '池沼',
    wrongAnswers: ['水道用地', 'ため池', '運河用地'],
    explanation: '灌漑用水でない水の貯留池は池沼です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_011',
    question: '釣堀や養鰻場',
    correctAnswer: '池沼',
    wrongAnswers: ['宅地', '雑種地', '水道用地', 'ため池', '運河用地'],
    explanation: '釣堀や養鰻場は池沼です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_012',
    question: '発電用ダム貯水池',
    correctAnswer: '池沼',
    wrongAnswers: ['宅地', '雑種地', '水道用地', 'ため池', '運河用地'],
    explanation: '発電用ダム貯水池は池沼です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_013',
    question: '耕作の方法によらないで竹木の生育する土地',
    correctAnswer: '山林',
    wrongAnswers: ['原野'],
    explanation: '竹木の生育する土地は山林です。',
    difficulty: 'easy'
  },
  {
    id: 'chimoku_014',
    question: '家畜を放牧する土地',
    correctAnswer: '牧場',
    wrongAnswers: ['雑種地', '原野'],
    explanation: '家畜を放牧し、または飼料を栽培する土地は牧場です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_015',
    question: '牧場のために使用する建物の敷地',
    correctAnswer: '牧場',
    wrongAnswers: ['宅地'],
    explanation: '牧場のために使用する建物の敷地は牧場です。',
    difficulty: 'medium'
  }
];

// 16-20問目（応用問題）
export const advancedQuestions: ChimokuQuestion[] = [
  {
    id: 'advanced_001',
    question: '物干場またはさらし場',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '物干場またはさらし場は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_002',
    question: '駐車場部分が垣根や柵等により判然と区別されている建物の敷地',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '駐車場部分が垣根や柵等により判然と区別されている建物の敷地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_003',
    question: '水力発電のための水路または排水路',
    correctAnswer: '雑種地',
    wrongAnswers: ['水道用地'],
    explanation: '水力発電のための水路または排水路は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_004',
    question: '高圧線の下の土地で他の目的に使用することができない区域',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '高圧線の下の土地で他の目的に使用することができない区域は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_005',
    question: '建物としての要件を備えていない鉄塔の敷地',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '建物としての要件を備えていない鉄塔の敷地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_006',
    question: '競馬場内の事務所、観覧車および厩舎',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '競馬場内の事務所、観覧車および厩舎は宅地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_007',
    question: '宅地に接続するテニスコート、プール',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '宅地に接続するテニスコート、プールは宅地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_008',
    question: '高圧線の下の土地で建物の敷地として利用されている土地',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '高圧線の下の土地で建物の敷地として利用されている土地は宅地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_009',
    question: '永久的設備と認められた雨覆いがある陶器かまどの設けられた土地',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '永久的設備と認められた雨覆いがある陶器かまどの設けられた土地は宅地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_010',
    question: '建物がある木場（木ぼり）の区域内の土地',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '建物がある木場（木ぼり）の区域内の土地は宅地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_011',
    question: '構内に建物の設備がある火葬場',
    correctAnswer: '宅地',
    wrongAnswers: ['雑種地'],
    explanation: '構内に建物の設備がある火葬場は宅地です。',
    difficulty: 'hard'
  }
];

// 選択肢生成用のヘルパー関数
export function getWrongAnswer(correctAnswer: string, wrongAnswers?: string[]): string {
  if (wrongAnswers && wrongAnswers.length > 0) {
    // 指定された不正解肢からランダムに選択
    return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  }
  
  // 指定がない場合は23地目から正解以外をランダムに選択
  const availableAnswers = ALL_CHIMOKU.filter(chimoku => chimoku !== correctAnswer);
  return availableAnswers[Math.floor(Math.random() * availableAnswers.length)];
}

// 全問題を統合（20問）
export const allQuestions: ChimokuQuestion[] = [
  ...chimokuQuestions,
  ...advancedQuestions
];