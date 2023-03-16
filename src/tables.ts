import {
    Table,
    Column,
    Types
} from '@subsquid/bigquery-store'

export const Pools = new Table('pools', {
    address: Column(Types.String()),
    token0: Column(Types.String()),
    token1: Column(Types.String())
})

export const Swaps = new Table('swaps', {
    txHash: Column(Types.String()),
    blockNumber: Column(Types.Int64()),
    timestamp: Column(Types.Timestamp()),
    pool: Column(Types.String()),
    sender: Column(Types.String()),
    amount0In: Column(Types.BigNumeric(38)),
    amount1In: Column(Types.BigNumeric(38)),
    amount0Out: Column(Types.BigNumeric(38)),
    amount1Out: Column(Types.BigNumeric(38)),
    to: Column(Types.String())
})
