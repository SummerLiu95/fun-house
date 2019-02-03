export interface TableListResponseType<T = any> {
  total: number;
  list: Array<T>;
}

export interface SearchResultItemType {
  href: string;
  score: number;
  title: string;
}
