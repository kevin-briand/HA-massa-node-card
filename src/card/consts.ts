import type { CardConfig } from './types'

export const massaNodeCard = 'massa-node-card'

export const massaNodeCardEditor = 'massa-node-card-editor'

export const entityPrefix = 'sensor.massa_node_'

export const defaultMassaNodeData = {
  status: 'Offline',
  massa_price: '0',
  wallet_amount: '0',
  produced_block: '0',
  missed_block: '0',
  active_rolls: '0',
  total_amount: '0',
  wallet_amount_with_rolls: '0',
  total_gain_of_day: '0'
}

export const defaultCardConfig: CardConfig = {
  type: '',
  show_wallet_amount: false
}
