import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as factoryAbi from './abi/factory'
import * as poolAbi from './abi/pool'
import {Pool, Swap} from './model'
import {Block, Context, FACTORY_ADDRESS, Log, Transaction, processor} from './processor'

let factoryPools: Set<string>

processor.run(new TypeormDatabase(), async (ctx) => {
    if (!factoryPools) {
        factoryPools = await ctx.store.findBy(Pool, {}).then((q) => new Set(q.map((i) => i.id)))
    }

    let pools: PoolData[] = []
    let swaps: SwapEvent[] = []

    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === FACTORY_ADDRESS) {
                pools.push(getPoolData(ctx, log))
            } else if (factoryPools.has(log.address)) {
                swaps.push(getSwap(ctx, log))
            }
        }
    }

    await createPools(ctx, pools)
    await processSwaps(ctx, swaps)
})

interface PoolData {
    id: string
    token0: string
    token1: string
}

function getPoolData(ctx: Context, log: Log): PoolData {
    let event = factoryAbi.events.PoolCreated.decode(log)

    let id = event.pool.toLowerCase()
    let token0 = event.token0.toLowerCase()
    let token1 = event.token1.toLowerCase()

    ctx.log.debug({block: log.block}, `Created pool ${id} (${token0}, ${token1})`)
    return {
        id,
        token0,
        token1,
    }
}

async function createPools(ctx: Context, poolsData: PoolData[]) {
    let pools: Pool[] = []

    for (let p of poolsData) {
        let pool = new Pool(p)
        pools.push(pool)
        factoryPools.add(pool.id)
    }

    await ctx.store.insert(pools)
}

interface SwapEvent {
    id: string
    block: Block
    transaction: Transaction
    pool: string
    amount0: bigint
    amount1: bigint
    recipient: string
    sender: string
}

function getSwap(ctx: Context, log: Log): SwapEvent {
    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    let event = poolAbi.events.Swap.decode(log)

    let pool = log.address
    let recipient = event.recipient.toLowerCase()
    let sender = event.sender.toLowerCase()

    ctx.log.debug(
        {block: log.block, txHash: transaction.hash},
        `Swap in ${pool} by ${recipient} amounts (${event.amount0}, ${event.amount1})`
    )
    return {
        id: log.id,
        block: log.block,
        transaction,
        pool,
        amount0: event.amount0,
        amount1: event.amount1,
        recipient,
        sender,
    }
}

async function processSwaps(ctx: Context, swapsData: SwapEvent[]) {
    let poolIds = new Set<string>()
    for (let t of swapsData) {
        poolIds.add(t.pool)
    }

    let pools = await ctx.store.findBy(Pool, {id: In([...poolIds])}).then(toEntityMap)

    let swaps: Swap[] = []
    for (let s of swapsData) {
        let {id, block, transaction, amount0, amount1, recipient, sender} = s

        let pool = assertNotNull(pools.get(s.pool))

        swaps.push(
            new Swap({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                pool,
                amount0,
                amount1,
                recipient,
                sender,
            })
        )
    }

    await ctx.store.insert(swaps)
}

function toEntityMap<E extends {id: string}>(entities: E[]): Map<string, E> {
    return new Map(entities.map((e) => [e.id, e]))
}
