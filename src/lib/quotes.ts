import quoteData from '@/data/study_quotes_100.json';
import { Quote } from '@/types/quote';

/**
 * 名言管理クラス
 */
export class QuoteManager {
  private static validQuotes: Quote[] | null = null;

  /**
   * 有効な名言リストを取得（フィルタリング済み）
   */
  private static getValidQuotes(): Quote[] {
    if (this.validQuotes === null) {
      this.validQuotes = quoteData.quotes.filter(quote => {
        // authorが空欄の場合は除外
        if (!quote.author || quote.author.trim() === '') {
          return false;
        }

        // occupationに"キリスト教"を含む場合は除外
        if (quote.occupation && quote.occupation.includes('キリスト教')) {
          return false;
        }

        return true;
      });
    }

    return this.validQuotes;
  }

  /**
   * ランダムな名言を1つ取得
   */
  static getRandomQuote(): Quote | null {
    const validQuotes = this.getValidQuotes();
    
    if (validQuotes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * validQuotes.length);
    const selectedQuote = validQuotes[randomIndex];
    
    return selectedQuote;
  }

  /**
   * 統計情報を取得
   */
  static getStats() {
    const validQuotes = this.getValidQuotes();
    const totalQuotes = quoteData.quotes.length;
    const filteredCount = totalQuotes - validQuotes.length;

    return {
      total: totalQuotes,
      valid: validQuotes.length,
      filtered: filteredCount
    };
  }
}