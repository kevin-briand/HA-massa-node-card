import { NodeApi } from '../node-api'
import { type AddressesInfo } from '../dto/addresses-info'
import { type HassConfigWithParams } from '../../hass/dto/hass-config-with-params'

export async function getAddressesQuery (config: HassConfigWithParams): Promise<AddressesInfo> {
  const api = new NodeApi(config.ip, config.port)
  return await api.fetchData('get_addresses', [[config.wallet_address]])
}
