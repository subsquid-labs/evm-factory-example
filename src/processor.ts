import {
    BatchHandlerContext,
    BatchProcessorItem,
    EvmBatchProcessor,
    EvmBlock,
} from '@subsquid/evm-processor'
import {LogItem} from '@subsquid/evm-processor/lib/interfaces/dataSelection'
import {
    Store,
    Database,
    LocalDest
} from '@subsquid/file-store'
import {lookupArchive} from '@subsquid/archive-registry'

import {Pools, Swaps} from './tables'
import * as factoryAbi from './abi/factory'
import * as pairAbi from './abi/pair'

const FACTORY_ADDRESSES = new Set([
	'0xBCfCcbde45cE874adCB698cC183deBcF17952812'.toLowerCase(),
	'0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'.toLowerCase() // v2
])

let processor = new EvmBatchProcessor()
    .setDataSource({
//        archive: lookupArchive('binance'),
        archive: 'https://binance-v0-15-0.archive.subsquid.io',
    })
    .setBlockRange({
        from: 586_851,
    })
    .addLog([...FACTORY_ADDRESSES], {
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
    dest: new LocalDest('/mirrorstorage/pancakes-data'),
    chunkSizeMb: 100
})

type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchHandlerContext<Store<typeof tables>, Item>

let factoryPools: Set<string>
let usedContracts = new Map<string, number>()
let unusedContracts = new Map<string, number>()

processor.run(db, async (ctx) => {
    if (!factoryPools) factoryPools = new Set()

    let poolCreationsData: PoolCreationData[] = []
    let swapsData: SwapData[] = []

    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.kind !== 'evmLog') continue

            let itemAddr = item.address.toLowerCase()
            if (FACTORY_ADDRESSES.has(itemAddr)) {
                let pcd = handlePoolCreation(ctx, item)
                factoryPools.add(pcd.address)
                poolCreationsData.push(pcd)
            } else if (factoryPools.has(itemAddr)) {
                swapsData.push(handleSwap(ctx, block.header, item))
            }
        }
    }

    ctx.store.Pools.writeMany(poolCreationsData)
    ctx.store.Swaps.writeMany(swapsData)
})

interface PoolCreationData {
    factory: string
    address: string
    token0: string
    token1: string
}

function handlePoolCreation(
    ctx: Ctx,
    item: LogItem<{evmLog: {topics: true; data: true}}>
): PoolCreationData {
    let event = factoryAbi.events.PairCreated.decode(item.evmLog)
    return {
        factory: item.address.toLowerCase()
        address: event.pair.toLowerCase(),
        token0: event.token0.toLowerCase(),
        token1: event.token1.toLowerCase()
    }
}

interface SwapData {
    txHash: string
    blockNumber: bigint
    timestamp: Date
    pool: string
    sender: string
    amount0In: string
    amount1In: string
    amount0Out: string
    amount1Out: string
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
        blockNumber: BigInt(block.height),
        timestamp: new Date(block.timestamp),
        pool: item.evmLog.address,
        sender: event.sender.toLowerCase(),
        amount0In: event.amount0In.toString(),
        amount1In: event.amount1In.toString(),
        amount0Out: event.amount0Out.toString(),
        amount1Out: event.amount1Out.toString(),
        to: event.to.toLowerCase()
    }
}
