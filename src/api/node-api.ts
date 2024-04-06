import axios, { Axios } from 'axios'

export class NodeApi extends Axios {
  constructor (baseURL: string, port: string) {
    if (typeof baseURL === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    super({
      ...axios.defaults,
      baseURL: `${baseURL}:${port}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }

  async fetchData (method: string, params: any = undefined): Promise<any> {
    const data = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    const result = await this.post('/', data)
    return result.data
  }
}
