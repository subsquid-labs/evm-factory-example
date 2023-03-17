import {
    Table,
    Column,
    Types
} from '@subsquid/file-store-parquet'

export const Pools = new Table(
    'pools.parquet',
    {
        factory: Column(Types.String()),
        address: Column(Types.String()),
        token0: Column(Types.String()),
        token1: Column(Types.String())
    },
    {
	    compression: 'GZIP'
    }
)

export const Swaps = new Table(
    'swaps.parquet',
    {
        txHash: Column(Types.String()),
        blockNumber: Column(Types.Uint64()),
        timestamp: Column(Types.Timestamp()),
        pool: Column(Types.String()),
        sender: Column(Types.String()),
        amount0In: Column(Types.String()),
        amount1In: Column(Types.String()),
        amount0Out: Column(Types.String()),
        amount1Out: Column(Types.String()),
        to: Column(Types.String())
    },
    {
	    compression: 'GZIP'
    }
)
