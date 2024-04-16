import axios, { Axios } from 'axios'

export class BitgetApi extends Axios {
  constructor () {
    super({
      ...axios.defaults,
      baseURL: 'https://api.bitget.com/api/v2/spot/market/',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }
}
