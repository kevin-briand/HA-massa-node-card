export interface AddressesInfo {
  jsonrpc: string
  result: AddressInfo[]
  id: number
}

export interface AddressInfo {
  address: string
  thread: number
  final_balance: string
  final_roll_count: number
  final_datastore_keys: any[]
  candidate_balance: string
  candidate_roll_count: number
  candidate_datastore_keys: any[]
  deferred_credits: any[]
  next_block_draws: any[]
  next_endorsement_draws: any[]
  created_blocks: any[]
  created_operations: any[]
  created_endorsements: any[]
  cycle_infos: CycleInfo[]
}

export interface CycleInfo {
  cycle: number
  is_final: boolean
  ok_count: number
  nok_count: number
  active_rolls?: number
}
