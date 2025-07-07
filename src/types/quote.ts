export interface Quote {
  id: number;
  text: string;
  author: string;
  occupation: string;
}

export interface QuoteData {
  quotes: Quote[];
}