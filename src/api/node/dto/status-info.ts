export interface StatusInfo {
  jsonrpc: string
  result: Result
  id: number
}

export interface Result {
  node_id: string
  node_ip: any
  version: string
  current_time: number
  current_cycle: number
  current_cycle_time: number
  next_cycle_time: number
  connected_nodes: ConnectedNodes
  last_slot: LastSlot
  next_slot: NextSlot
  consensus_stats: ConsensusStats
  pool_stats: number[]
  network_stats: NetworkStats
  execution_stats: ExecutionStats
  config: Config
  chain_id: number
}

export type ConnectedNodes = Record<string, [string, boolean]>

export interface LastSlot {
  period: number
  thread: number
}

export interface NextSlot {
  period: number
  thread: number
}

export interface ConsensusStats {
  start_timespan: number
  end_timespan: number
  final_block_count: number
  stale_block_count: number
  clique_count: number
}

export interface NetworkStats {
  in_connection_count: number
  out_connection_count: number
  known_peer_count: number
  banned_peer_count: number
  active_node_count: number
}

export interface ExecutionStats {
  time_window_start: number
  time_window_end: number
  final_block_count: number
  final_executed_operations_count: number
  active_cursor: ActiveCursor
  final_cursor: FinalCursor
}

export interface ActiveCursor {
  period: number
  thread: number
}

export interface FinalCursor {
  period: number
  thread: number
}

export interface Config {
  genesis_timestamp: number
  end_timestamp: any
  thread_count: number
  t0: number
  delta_f0: number
  operation_validity_periods: number
  periods_per_cycle: number
  block_reward: string
  roll_price: string
  max_block_size: number
}
