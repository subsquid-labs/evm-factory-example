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

import fs from 'fs'

const FACTORY_ADDRESSES = new Set([
	'0xBCfCcbde45cE874adCB698cC183deBcF17952812'.toLowerCase(),
	'0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'.toLowerCase() // v2
])

const outPath = '/mirrorstorage/pancakes-data'
const outPathStats = '/mirrorstorage/pancakes-stats'

let processor = new EvmBatchProcessor()
    .setDataSource({
        archive: lookupArchive('binance'),
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
    dest: new LocalDest(outPath),
    chunkSizeMb: 100
})

type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchHandlerContext<Store<typeof tables>, Item>

processor.run(db, async (ctx) => {
    if (!factoryPools) factoryPools = new Set()

    let poolCreationsData: PoolCreationData[] = []
    let swapsData: SwapData[] = []

    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.kind !== 'evmLog') continue

            let itemAddr = item.address.toLowerCase()
            if (FACTORY_ADDRESSES.has(itemAddr)) {
                poolCreationsData.push(handlePoolCreation(ctx, item))
            } else if (factoryPools.has(itemAddr)) {
                swapsData.push(handleSwap(ctx, block.header, item))
                registerItem(itemAddr, usedContracts)
            } else {
                registerItem(itemAddr, unusedContracts)
            }
        }
    }

    keepRecords(usedContracts, `${outPathStats}-used-contracts`)
    keepRecords(unusedContracts, `${outPathStats}-unused-contracts`)

    savePools(ctx, poolCreationsData)
    saveSwaps(ctx, swapsData)
})

let factoryPools: Set<string>

function savePools(ctx: Ctx, poolsData: PoolCreationData[]) {
    for (let p of poolsData) {
        ctx.store.Pools.write(p)
        factoryPools.add(p.address)
    }
}

function saveSwaps(ctx: Ctx, swapsData: SwapData[]) {
    ctx.store.Swaps.writeMany(swapsData)
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
    blockNumber: bigint
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
        blockNumber: BigInt(block.height),
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

let usedContracts = new Map<string, number>()
let unusedContracts = new Map<string, number>()

function registerItem(address: string, records: Map<string, number>) {
    if(records.has(address)) {
        records.set(address, records.get(address)!+1)
    }
    else {
        records.set(address, 1)
    }
}

function keepRecords(records: Map<string, number>, path: string) {
    fs.writeFileSync(path, [...records].sort((a, b) => b[1]-a[1]).map(e => `${e[0]} ${e[1]}`).join('\n'))
}
