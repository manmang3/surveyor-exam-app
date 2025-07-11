// 試験日設定と計算のユーティリティ

const EXAM_DATE_KEY = 'surveyor_exam_date';

export class ExamDateManager {
  /**
   * 指定年の10月第3日曜日を計算
   */
  static getThirdSundayOfOctober(year: number): Date {
    // 10月の全日曜日を探して第3日曜日を返す
    let sundayCount = 0;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, 9, day); // 10月のday日
      if (date.getMonth() > 9) break; // 11月になったら終了
      if (date.getDay() === 0) { // 日曜日
        sundayCount++;
        if (sundayCount === 3) {
          return date;
        }
      }
    }
    // フォールバック（通常は到達しない）
    return new Date(year, 9, 15);
  }

  /**
   * 直近の10月第3日曜日を取得（デフォルト試験日）
   */
  static getDefaultExamDate(): Date {
    // 2025年の試験日は10月19日に固定
    const exam2025 = new Date(2025, 9, 19); // 2025年10月19日
    const today = new Date();
    
    // 2025年の試験日が過ぎていなければ2025年の試験日を返す
    if (today <= exam2025) {
      return exam2025;
    }
    
    // 2025年の試験日が過ぎていれば来年の試験日を計算
    const currentYear = today.getFullYear();
    return this.getThirdSundayOfOctober(currentYear + 1);
  }

  /**
   * 設定された試験日を取得
   */
  static getExamDate(): Date {
    if (typeof window === 'undefined') {
      return this.getDefaultExamDate();
    }

    const savedDate = localStorage.getItem(EXAM_DATE_KEY);
    if (savedDate) {
      // YYYY-MM-DD形式から日付を復元
      if (savedDate.includes('-') && savedDate.length === 10) {
        const [year, month, day] = savedDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      } else {
        // 古いISO形式の場合は削除してデフォルトを使用
        localStorage.removeItem(EXAM_DATE_KEY);
      }
    }
    
    return this.getDefaultExamDate();
  }

  /**
   * 試験日を設定
   */
  static setExamDate(date: Date): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXAM_DATE_KEY, this.formatDate(date));
    }
  }

  /**
   * 試験日までの残り日数を計算
   */
  static getDaysUntilExam(): number {
    const examDate = this.getExamDate();
    const today = new Date();
    
    // 今日を含めて試験日までの日数を計算
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    
    const diffTime = examDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 試験日を含む
    
    return Math.max(0, diffDays); // 負の値は返さない
  }

  /**
   * 試験日設定をリセット
   */
  static resetExamDate(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(EXAM_DATE_KEY);
    }
  }

  /**
   * 日付をフォーマット（YYYY-MM-DD）
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 日付を日本語表記でフォーマット
   */
  static formatDateJP(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
}