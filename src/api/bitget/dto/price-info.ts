export interface PriceInfoResult {
  code: string
  msg: string
  requestTime: number
  data: PriceInfo[]
}

export interface PriceInfo {
  open: string
  symbol: string
  high24h: string
  low24h: string
  lastPr: string
  quoteVolume: string
  baseVolume: string
  usdtVolume: string
  ts: string
  bidPr: string
  askPr: string
  bidSz: string
  askSz: string
  openUtc: string
  changeUtc24h: string
  change24h: string
}
