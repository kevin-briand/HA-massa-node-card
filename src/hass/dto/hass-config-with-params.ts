import type { HassConfig } from 'home-assistant-js-websocket/dist/types'

export type HassConfigWithParams = HassConfig & {
  ip: string
  port: string
  wallet_address: string
}
