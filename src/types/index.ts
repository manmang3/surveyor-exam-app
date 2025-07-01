export interface Question {
  id: string;
  year: number;
  category: string;
  subcategory?: string;
  questionNumber: number;
  title: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSession {
  id: string;
  questions: Question[];
  answers: (number | null)[];
  score: number | null;
  startTime: Date;
  endTime: Date | null;
}

export interface QuizResult {
  session: QuizSession;
  correctCount: number;
  totalCount: number;
  percentage: number;
}