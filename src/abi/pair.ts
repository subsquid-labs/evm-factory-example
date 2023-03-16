import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './pair.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    Approval: new LogEvent<([owner: string, spender: string, value: ethers.BigNumber] & {owner: string, spender: string, value: ethers.BigNumber})>(
        abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
    ),
    Burn: new LogEvent<([sender: string, amount0: ethers.BigNumber, amount1: ethers.BigNumber, to: string] & {sender: string, amount0: ethers.BigNumber, amount1: ethers.BigNumber, to: string})>(
        abi, '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496'
    ),
    Mint: new LogEvent<([sender: string, amount0: ethers.BigNumber, amount1: ethers.BigNumber] & {sender: string, amount0: ethers.BigNumber, amount1: ethers.BigNumber})>(
        abi, '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
    ),
    Swap: new LogEvent<([sender: string, amount0In: ethers.BigNumber, amount1In: ethers.BigNumber, amount0Out: ethers.BigNumber, amount1Out: ethers.BigNumber, to: string] & {sender: string, amount0In: ethers.BigNumber, amount1In: ethers.BigNumber, amount0Out: ethers.BigNumber, amount1Out: ethers.BigNumber, to: string})>(
        abi, '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822'
    ),
    Sync: new LogEvent<([reserve0: ethers.BigNumber, reserve1: ethers.BigNumber] & {reserve0: ethers.BigNumber, reserve1: ethers.BigNumber})>(
        abi, '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'
    ),
    Transfer: new LogEvent<([from: string, to: string, value: ethers.BigNumber] & {from: string, to: string, value: ethers.BigNumber})>(
        abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ),
}

export const functions = {
    DOMAIN_SEPARATOR: new Func<[], {}, string>(
        abi, '0x3644e515'
    ),
    MINIMUM_LIQUIDITY: new Func<[], {}, ethers.BigNumber>(
        abi, '0xba9a7a56'
    ),
    PERMIT_TYPEHASH: new Func<[], {}, string>(
        abi, '0x30adf81f'
    ),
    allowance: new Func<[_: string, _: string], {}, ethers.BigNumber>(
        abi, '0xdd62ed3e'
    ),
    approve: new Func<[spender: string, value: ethers.BigNumber], {spender: string, value: ethers.BigNumber}, boolean>(
        abi, '0x095ea7b3'
    ),
    balanceOf: new Func<[_: string], {}, ethers.BigNumber>(
        abi, '0x70a08231'
    ),
    burn: new Func<[to: string], {to: string}, ([amount0: ethers.BigNumber, amount1: ethers.BigNumber] & {amount0: ethers.BigNumber, amount1: ethers.BigNumber})>(
        abi, '0x89afcb44'
    ),
    decimals: new Func<[], {}, number>(
        abi, '0x313ce567'
    ),
    factory: new Func<[], {}, string>(
        abi, '0xc45a0155'
    ),
    getReserves: new Func<[], {}, ([_reserve0: ethers.BigNumber, _reserve1: ethers.BigNumber, _blockTimestampLast: number] & {_reserve0: ethers.BigNumber, _reserve1: ethers.BigNumber, _blockTimestampLast: number})>(
        abi, '0x0902f1ac'
    ),
    initialize: new Func<[_token0: string, _token1: string], {_token0: string, _token1: string}, []>(
        abi, '0x485cc955'
    ),
    kLast: new Func<[], {}, ethers.BigNumber>(
        abi, '0x7464fc3d'
    ),
    mint: new Func<[to: string], {to: string}, ethers.BigNumber>(
        abi, '0x6a627842'
    ),
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
    nonces: new Func<[_: string], {}, ethers.BigNumber>(
        abi, '0x7ecebe00'
    ),
    permit: new Func<[owner: string, spender: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string], {owner: string, spender: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string}, []>(
        abi, '0xd505accf'
    ),
    price0CumulativeLast: new Func<[], {}, ethers.BigNumber>(
        abi, '0x5909c0d5'
    ),
    price1CumulativeLast: new Func<[], {}, ethers.BigNumber>(
        abi, '0x5a3d5493'
    ),
    skim: new Func<[to: string], {to: string}, []>(
        abi, '0xbc25cf77'
    ),
    swap: new Func<[amount0Out: ethers.BigNumber, amount1Out: ethers.BigNumber, to: string, data: string], {amount0Out: ethers.BigNumber, amount1Out: ethers.BigNumber, to: string, data: string}, []>(
        abi, '0x022c0d9f'
    ),
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
    sync: new Func<[], {}, []>(
        abi, '0xfff6cae9'
    ),
    token0: new Func<[], {}, string>(
        abi, '0x0dfe1681'
    ),
    token1: new Func<[], {}, string>(
        abi, '0xd21220a7'
    ),
    totalSupply: new Func<[], {}, ethers.BigNumber>(
        abi, '0x18160ddd'
    ),
    transfer: new Func<[to: string, value: ethers.BigNumber], {to: string, value: ethers.BigNumber}, boolean>(
        abi, '0xa9059cbb'
    ),
    transferFrom: new Func<[from: string, to: string, value: ethers.BigNumber], {from: string, to: string, value: ethers.BigNumber}, boolean>(
        abi, '0x23b872dd'
    ),
}

export class Contract extends ContractBase {

    DOMAIN_SEPARATOR(): Promise<string> {
        return this.eth_call(functions.DOMAIN_SEPARATOR, [])
    }

    MINIMUM_LIQUIDITY(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.MINIMUM_LIQUIDITY, [])
    }

    PERMIT_TYPEHASH(): Promise<string> {
        return this.eth_call(functions.PERMIT_TYPEHASH, [])
    }

    allowance(arg0: string, arg1: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.allowance, [arg0, arg1])
    }

    balanceOf(arg0: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.balanceOf, [arg0])
    }

    decimals(): Promise<number> {
        return this.eth_call(functions.decimals, [])
    }

    factory(): Promise<string> {
        return this.eth_call(functions.factory, [])
    }

    getReserves(): Promise<([_reserve0: ethers.BigNumber, _reserve1: ethers.BigNumber, _blockTimestampLast: number] & {_reserve0: ethers.BigNumber, _reserve1: ethers.BigNumber, _blockTimestampLast: number})> {
        return this.eth_call(functions.getReserves, [])
    }

    kLast(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.kLast, [])
    }

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }

    nonces(arg0: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.nonces, [arg0])
    }

    price0CumulativeLast(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.price0CumulativeLast, [])
    }

    price1CumulativeLast(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.price1CumulativeLast, [])
    }

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }

    token0(): Promise<string> {
        return this.eth_call(functions.token0, [])
    }

    token1(): Promise<string> {
        return this.eth_call(functions.token1, [])
    }

    totalSupply(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.totalSupply, [])
    }
}
