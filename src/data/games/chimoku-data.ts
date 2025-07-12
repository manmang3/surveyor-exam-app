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
  },
  {
    id: 'chimoku_016',
    question: '耕作の方法によらないで雑草、かん木類の生息する土地',
    correctAnswer: '原野',
    wrongAnswers: ['山林'],
    explanation: '耕作の方法によらないで雑草、かん木類の生息する土地は原野です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_017',
    question: '人の遺体、または遺骨を埋葬する土地',
    correctAnswer: '墓地',
    wrongAnswers: ['雑種地'],
    explanation: '人の遺体、または遺骨を埋葬する土地は墓地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_018',
    question: '本殿、拝殿、本堂、神社、庫裏、社務所、教会、修道院がある土地',
    correctAnswer: '境内地',
    wrongAnswers: ['宅地'],
    explanation: '本殿、拝殿、本堂、神社、庫裏、社務所、教会、修道院がある土地は境内地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_019',
    question: '運河に関する水路や道路、堤防などの土地',
    correctAnswer: '運河用地',
    wrongAnswers: ['水道用地', '堤'],
    explanation: '運河に関する水路や道路、堤防などの土地は運河用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_020',
    question: '専ら給水の目的で敷設する水道の水源地',
    correctAnswer: '水道用地',
    wrongAnswers: ['ため池', '池沼', '運河用地'],
    explanation: '専ら給水の目的で敷設する水道の水源地は水道用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_021',
    question: '浄水場内の事務所の敷地',
    correctAnswer: '水道用地',
    wrongAnswers: ['ため池', '池沼', '運河用地'],
    explanation: '浄水場内の事務所の敷地は水道用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_022',
    question: '水道用のダム貯水池',
    correctAnswer: '水道用地',
    wrongAnswers: ['ため池', '池沼', '運河用地'],
    explanation: '水道用のダム貯水池は水道用地です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_023',
    question: 'かんがい用または悪水排せつ用の水路の土地',
    correctAnswer: '用悪水路',
    wrongAnswers: [],
    explanation: 'かんがい用または悪水排せつ用の水路の土地は用悪水路です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_024',
    question: '耕地かんがい用の用水貯留地',
    correctAnswer: 'ため池',
    wrongAnswers: ['池沼'],
    explanation: '耕地かんがい用の用水貯留地はため池です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_025',
    question: '防水のために築造した堤防の土地',
    correctAnswer: '堤',
    wrongAnswers: ['運河用地', '水道用地'],
    explanation: '防水のために築造した堤防の土地は堤です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_026',
    question: '一般交通の用に供する道路として利用されている堤防の天端の部分',
    correctAnswer: '堤',
    wrongAnswers: [],
    explanation: '一般交通の用に供する道路として利用されている堤防の天端の部分は堤です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_027',
    question: '田畝または村落の間にある通水路',
    correctAnswer: '井溝',
    wrongAnswers: [],
    explanation: '田畝または村落の間にある通水路は井溝です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_028',
    question: '森林法に基づき農林水産大臣が保安林として指定した土地',
    correctAnswer: '保安林',
    wrongAnswers: ['山林', '雑種地'],
    explanation: '森林法に基づき農林水産大臣が保安林として指定した土地は保安林です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_029',
    question: '一般公衆の交通の用に供する道路の土地',
    correctAnswer: '公衆用道路',
    wrongAnswers: ['公園'],
    explanation: '一般公衆の交通の用に供する道路の土地は公衆用道路です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_030',
    question: '公衆の遊楽のために供する土地',
    correctAnswer: '公園',
    wrongAnswers: ['雑種地'],
    explanation: '公衆の遊楽のために供する土地は公園です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_031',
    question: '公園内にある運動施設',
    correctAnswer: '公園',
    wrongAnswers: ['宅地'],
    explanation: '公園内にある運動施設は公園です。',
    difficulty: 'medium'
  },
  {
    id: 'chimoku_032',
    question: '動物の遺体、遺骨を埋葬する土地',
    correctAnswer: '雑種地',
    wrongAnswers: ['墓地'],
    explanation: '動物の遺体、遺骨を埋葬する土地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_033',
    question: '山林の急傾斜地に土砂崩れや地滑り防止のための擁壁が占める土地',
    correctAnswer: '雑種地',
    wrongAnswers: ['堤'],
    explanation: '山林の急傾斜地に土砂崩れや地滑り防止のための擁壁が占める土地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'chimoku_034',
    question: '坑口、やぐら敷地、精錬所の煙道敷地',
    correctAnswer: '雑種地',
    wrongAnswers: [],
    explanation: '坑口、やぐら敷地、精錬所の煙道敷地は雑種地です。',
    difficulty: 'hard'
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
  },
  {
    id: 'advanced_012',
    question: '変電所敷地',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '変電所敷地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_013',
    question: '建物敷地以外の土地の利用を主とした遊園地、運動場、ゴルフ場、飛行場',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '建物敷地以外の土地の利用を主とした遊園地、運動場、ゴルフ場、飛行場は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_014',
    question: 'ガソリンスタンド',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: 'ガソリンスタンドは雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_015',
    question: '競馬場内の馬場',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '競馬場内の馬場は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_016',
    question: '永久的設備と認められた雨覆いがない陶器かまどの設けられた土地',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '永久的設備と認められた雨覆いがない陶器かまどの設けられた土地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_017',
    question: '建物がない木場（木ぼり）の区域内の土地',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '建物がない木場（木ぼり）の区域内の土地は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_018',
    question: '構内に建物の設備がない火葬場',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '構内に建物の設備がない火葬場は雑種地です。',
    difficulty: 'hard'
  },
  {
    id: 'advanced_019',
    question: '宅地に接続しないテニスコート、プール',
    correctAnswer: '雑種地',
    wrongAnswers: ['宅地'],
    explanation: '宅地に接続しないテニスコート、プールは雑種地です。',
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