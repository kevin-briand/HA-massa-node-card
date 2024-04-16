import { NodeApi } from '../node-api'
import { type HassConfigWithParams } from '../../../hass/dto/hass-config-with-params'
import { type StatusInfo } from '../dto/status-info'

export async function getStatusQuery (config: HassConfigWithParams): Promise<StatusInfo> {
  const api = new NodeApi(config.ip, config.port)
  return await api.fetchData('get_status')
}
