import {
    Table,
    Column,
    StringType,
    TimestampType,
    NumericType,
    Int64,
    ArrayType
} from '@subsquid/bigquery-store'

export const Pools = new Table('pools', {
    address: Column(StringType()),
    token0: Column(StringType()),
    token1: Column(StringType())
})

export const Swaps = new Table('swaps', {
    txHash: Column(StringType()),
    blockNumber: Column(Int64()),
    timestamp: Column(TimestampType()),
    pool: Column(StringType()),
    sender: Column(StringType()),
    amount0In: Column(NumericType()),
    amount1In: Column(NumericType()),
    amount0Out: Column(NumericType()),
    amount1Out: Column(NumericType()),
    to: Column(StringType())
})
