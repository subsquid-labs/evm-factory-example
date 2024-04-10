import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'
import {Store} from '@subsquid/typeorm-store'
import * as factoryAbi from './abi/factory'
import * as poolAbi from './abi/pool'

export const FACTORY_ADDRESS = '0x1f98431c8ad98523631ae4a59f267346ea31f984'

export const processor = new EvmBatchProcessor()
    .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
        url: 'https://eth-mainnet.public.blastapi.io',
        rateLimit: 10
    })
    .setFinalityConfirmation(75)
    .setBlockRange({
        from: 12_369_621,
    })
    .setFields({
        log: {
            topics: true,
            data: true,
        },
        transaction: {
            hash: true,
        },
    })
    .addLog({
        address: [FACTORY_ADDRESS],
        topic0: [factoryAbi.events.PoolCreated.topic],
    })
    .addLog({
        topic0: [poolAbi.events.Swap.topic],
        transaction: true,
    })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
