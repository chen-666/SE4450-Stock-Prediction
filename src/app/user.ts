export interface User {
  id: number,
  username: string,
  password: string,
  email: string,
  watchlist: StockInfo[]
}


export interface StockInfo {
  id?: number,
  symbol: string,
  price?: number,
  last_price?: number,
}
