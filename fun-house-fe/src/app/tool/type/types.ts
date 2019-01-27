export interface TableListResponseType<T = any> {
  total: number;
  list: Array<T>;
  pageNum: number;
  pageSize: number;
}
