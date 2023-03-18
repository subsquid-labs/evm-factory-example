import {EvmBatchProcessor} from '@subsquid/evm-processor'
import {Database, LocalDest} from '@subsquid/file-store'
import {lookupArchive} from '@subsquid/archive-registry'
import {Table} from '@subsquid/file-store-json'

import * as factoryAbi from './abi/factory'

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
//        to: 26_548_500
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

let tables = { Pools: new Table<{address: string, factory: string}>('transfers.json') }
let db = new Database({
    tables: tables,
    dest: new LocalDest('./data'),
    syncIntervalBlocks: 1000,
    chunkSizeMb: 100
})

processor.run(db, async (ctx) => {
    let poolCreationsData: {address: string, factory: string}[] = []

    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.kind !== 'evmLog') continue

            let itemAddr = item.address.toLowerCase()
            if (FACTORY_ADDRESSES.has(itemAddr)) {
                let event = factoryAbi.events.PairCreated.decode(item.evmLog)
                poolCreationsData.push({address: event.pair.toLowerCase(), factory: itemAddr})
            }
        }
    }

    ctx.store.Pools.writeMany(poolCreationsData)
})
