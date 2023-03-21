import {
    BatchHandlerContext,
    BatchProcessorItem,
    EvmBatchProcessor,
    EvmBlock,
} from '@subsquid/evm-processor'
import {lookupArchive} from '@subsquid/archive-registry'
import {LogItem} from '@subsquid/evm-processor/lib/interfaces/dataSelection'
import {Store, Database} from '@subsquid/file-store'
import {S3Dest} from '@subsquid/file-store-s3'
import {assertNotNull} from '@subsquid/util-internal'

import {Pools, Swaps} from './tables'
import * as factoryAbi from './abi/factory'
import * as pairAbi from './abi/pair'
import assert from 'assert'

const FACTORY_ADDRESSES = new Set([
	'0xBCfCcbde45cE874adCB698cC183deBcF17952812'.toLowerCase(),
	'0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'.toLowerCase() // v2
])

let processor = new EvmBatchProcessor()
    .setDataSource({
        archive: lookupArchive('binance')
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
interface Metadata {
    height: number
    pools: string[]
}
let factoryPools: Set<string>
let db = new Database({
    tables: tables,
    dest: new S3Dest(
        'pancakeswaps',
        assertNotNull(process.env.S3_BUCKET_NAME),
        {
            region: 'us-east-1',
            endpoint: 'https://s3.filebase.com',
            credentials: {
                accessKeyId: assertNotNull(process.env.S3_ACCESS_KEY_ID),
                secretAccessKey: assertNotNull(process.env.S3_SECRET_ACCESS_KEY)
            }
        }
    ),
    chunkSizeMb: 20,
    hooks: {
        async onConnect(dest) {
            if (await dest.exists('status.json')) {
                let {height, pools}: Metadata = await dest.readFile('status.json').then(JSON.parse)
                assert(Number.isSafeInteger(height))
                factoryPools = new Set<string>([...pools])
                return height
            } else {
                factoryPools = new Set<string>()
                return -1
            }
        },
        async onFlush(dest, range) {
            console.log(factoryPools.size)
            let metadata: Metadata = {
                height: range.to,
                pools: [...factoryPools],
            }
            await dest.writeFile('status.json', JSON.stringify(metadata))
        },
    },
})

type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchHandlerContext<Store<typeof tables>, Item>

let usedContracts = new Map<string, number>()
let unusedContracts = new Map<string, number>()

processor.run(db, async (ctx) => {
    assert(factoryPools)

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
        factory: item.address.toLowerCase(),
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
