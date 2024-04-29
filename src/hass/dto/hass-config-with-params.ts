import type { HassConfig } from 'home-assistant-js-websocket/dist/types'

export type HassConfigWithParams = HassConfig & {
  // Show wallet amount and its price in the card
  show_wallet_amount: boolean
}
