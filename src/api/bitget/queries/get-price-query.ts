import { BitgetApi } from '../bitget-api'
import { type PriceInfo, type PriceInfoResult } from '../dto/price-info'

export async function getPriceQuery (): Promise<PriceInfo> {
  const api = new BitgetApi()
  const result = await api.get<PriceInfoResult>('tickers?symbol=MASUSDT')
  return result.data.data[0]
}
