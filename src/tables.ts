import {
    Table,
    Column,
    Types
} from '@subsquid/file-store-parquet'

export const Pools = new Table('pools.parquet', {
    address: Column(Types.String()),
    token0: Column(Types.String()),
    token1: Column(Types.String())
})

export const Swaps = new Table('swaps.parquet', {
    txHash: Column(Types.String()),
    blockNumber: Column(Types.Uint64()),
    timestamp: Column(Types.Timestamp()),
    pool: Column(Types.String()),
    sender: Column(Types.String()),
    amount0In: Column(Types.Decimal(42)),
    amount1In: Column(Types.Decimal(42)),
    amount0Out: Column(Types.Decimal(42)),
    amount1Out: Column(Types.Decimal(42)),
    to: Column(Types.String())
})
