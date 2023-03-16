import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './factory.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    PairCreated: new LogEvent<([token0: string, token1: string, pair: string, _: ethers.BigNumber] & {token0: string, token1: string, pair: string})>(
        abi, '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
    ),
}

export const functions = {
    INIT_CODE_PAIR_HASH: new Func<[], {}, string>(
        abi, '0x5855a25a'
    ),
    allPairs: new Func<[_: ethers.BigNumber], {}, string>(
        abi, '0x1e3dd18b'
    ),
    allPairsLength: new Func<[], {}, ethers.BigNumber>(
        abi, '0x574f2ba3'
    ),
    createPair: new Func<[tokenA: string, tokenB: string], {tokenA: string, tokenB: string}, string>(
        abi, '0xc9c65396'
    ),
    feeTo: new Func<[], {}, string>(
        abi, '0x017e7e58'
    ),
    feeToSetter: new Func<[], {}, string>(
        abi, '0x094b7415'
    ),
    getPair: new Func<[_: string, _: string], {}, string>(
        abi, '0xe6a43905'
    ),
    setFeeTo: new Func<[_feeTo: string], {_feeTo: string}, []>(
        abi, '0xf46901ed'
    ),
    setFeeToSetter: new Func<[_feeToSetter: string], {_feeToSetter: string}, []>(
        abi, '0xa2e74af6'
    ),
}

export class Contract extends ContractBase {

    INIT_CODE_PAIR_HASH(): Promise<string> {
        return this.eth_call(functions.INIT_CODE_PAIR_HASH, [])
    }

    allPairs(arg0: ethers.BigNumber): Promise<string> {
        return this.eth_call(functions.allPairs, [arg0])
    }

    allPairsLength(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.allPairsLength, [])
    }

    feeTo(): Promise<string> {
        return this.eth_call(functions.feeTo, [])
    }

    feeToSetter(): Promise<string> {
        return this.eth_call(functions.feeToSetter, [])
    }

    getPair(arg0: string, arg1: string): Promise<string> {
        return this.eth_call(functions.getPair, [arg0, arg1])
    }
}
