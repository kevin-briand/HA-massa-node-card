import type { HassConfig } from 'home-assistant-js-websocket/dist/types'

export interface MassaNodeData {
  status: string
  massa_price: string
  wallet_amount: string
  produced_block: string
  missed_block: string
  active_rolls: string
  total_amount: string
  wallet_amount_with_rolls: string
  total_gain_of_day: string
}

export interface EntityData {
  entity_id: string
  state: string
  attributes: Attributes
  last_changed: string
  last_reported: string
  last_updated: string
  context: Context
}

interface Attributes {
  unit_of_measurement: string
}

interface Context {
  id: string
  parent_id: any
  user_id: any
}

export type CardConfig = CardParams & {
  type: string
}

export type HassConfigWithParams = HassConfig & CardParams

export interface CardParams {
  // Show wallet amount and its price in the card
  show_wallet_amount: boolean
}
