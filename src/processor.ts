import {
    assertNotNull,
    BatchHandlerContext,
    BatchProcessorItem,
    EvmBatchProcessor,
    EvmBlock,
} from '@subsquid/evm-processor'
import {LogItem} from '@subsquid/evm-processor/lib/interfaces/dataSelection'
import {Store, Database} from '@subsquid/bigquery-store'
import {lookupArchive} from '@subsquid/archive-registry'
import assert from 'assert'

import {bigQuery} from './big-query'
import {Pools, Swaps} from './tables'
import * as factoryAbi from './abi/factory'
import * as pairAbi from './abi/pair'

assert(process.env.GOOGLE_DATASET_ID, 'GOOGLE_DATASET_ID must be set')
assert(process.env.GOOGLE_DATASET_LOCATION, 'GOOGLE_DATASET_LOCATION must be set')

export const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'.toLowerCase()

let processor = new EvmBatchProcessor()
    .setDataSource({
        archive: lookupArchive('binance'),
    })
    .setBlockRange({
        from: 6_809_737,
    })
    .addLog(FACTORY_ADDRESS, {
        filter: [[factoryAbi.events.PairCreated.topic]],
        data: {
            evmLog: {
                topics: true,
                data: true,
            },
        } as const,
    })
    .addLog([], {
        filter: [[pairAbi.events.Swap.topic]],
        data: {
            evmLog: {
                topics: true,
                data: true,
            },
            transaction: {
                hash: true,
            },
        } as const,
    })

let tables = { Pools, Swaps }
let db = new Database({
    tables: tables,
    bq: bigQuery,
    dataset: process.env.GOOGLE_DATASET_ID
})
type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchHandlerContext<Store<typeof tables>, Item>

processor.run(db, async (ctx) => {
    if (!factoryPools) {
        factoryPools = await getPools()
        ctx.log.info('Retrieved the set of pools from the BQ dataset:')
        // ctx.log.info(factoryPools)
    }

    let poolCreationsData: PoolCreationData[] = []
    let swapsData: SwapData[] = []

    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.kind !== 'evmLog') continue

            if (item.address === FACTORY_ADDRESS) {
                poolCreationsData.push(handlePoolCreation(ctx, item))
            } else if (factoryPools.has(item.address)) {
                swapsData.push(handleSwap(ctx, block.header, item))
            }
        }
    }

    savePools(ctx, poolCreationsData)
    saveSwaps(ctx, swapsData)
})

let factoryPools: Set<string>

async function getPools() {
    let [job] = await bigQuery.createQueryJob({
        query: `SELECT address FROM \`${process.env.GOOGLE_DATASET_ID}.pools\``,
        location: process.env.GOOGLE_DATASET_LOCATION
    })
    let [rows] = await job.getQueryResults()
    return new Set(rows.map(r => r.address))
}

function savePools(ctx: Ctx, poolsData: PoolCreationData[]) {
    for (let p of poolsData) {
        ctx.store.Pools.insert(p)
        factoryPools.add(p.address)
    }
}

function saveSwaps(ctx: Ctx, swapsData: SwapData[]) {
    ctx.store.Swaps.insertMany(swapsData)
}

interface PoolCreationData {
    address: string
    token0: string
    token1: string
}

function handlePoolCreation(ctx: Ctx, item: LogItem<{evmLog: {topics: true; data: true}}>): PoolCreationData {
    let event = factoryAbi.events.PairCreated.decode(item.evmLog)
    return {
        address: event.pair.toLowerCase(),
        token0: event.token0.toLowerCase(),
        token1: event.token1.toLowerCase()
    }
}

interface SwapData {
    txHash: string
    blockNumber: number
    timestamp: Date
    pool: string
    sender: string
    amount0In: bigint
    amount1In: bigint
    amount0Out: bigint
    amount1Out: bigint
    to: string
}

function handleSwap(
    ctx: Ctx,
    block: EvmBlock,
    item: LogItem<{evmLog: {topics: true; data: true}; transaction: {hash: true}}>
): SwapData {
    let event = pairAbi.events.Swap.decode(item.evmLog)
    return {
        txHash: item.transaction.hash,
        blockNumber: block.height,
        timestamp: new Date(block.timestamp),
        pool: item.evmLog.address,
        sender: event.sender.toLowerCase(),
        amount0In: event.amount0In.toBigInt(),
        amount1In: event.amount1In.toBigInt(),
        amount0Out: event.amount0Out.toBigInt(),
        amount1Out: event.amount1Out.toBigInt(),
        to: event.to.toLowerCase()
    }
}
