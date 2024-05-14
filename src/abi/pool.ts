import * as p from '@subsquid/evm-codec'
import { event, fun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Burn: event("0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c", {"owner": indexed(p.address), "tickLower": indexed(p.int24), "tickUpper": indexed(p.int24), "amount": p.uint128, "amount0": p.uint256, "amount1": p.uint256}),
    Collect: event("0x70935338e69775456a85ddef226c395fb668b63fa0115f5f20610b388e6ca9c0", {"owner": indexed(p.address), "recipient": p.address, "tickLower": indexed(p.int24), "tickUpper": indexed(p.int24), "amount0": p.uint128, "amount1": p.uint128}),
    CollectProtocol: event("0x596b573906218d3411850b26a6b437d6c4522fdb43d2d2386263f86d50b8b151", {"sender": indexed(p.address), "recipient": indexed(p.address), "amount0": p.uint128, "amount1": p.uint128}),
    Flash: event("0xbdbdb71d7860376ba52b25a5028beea23581364a40522f6bcfb86bb1f2dca633", {"sender": indexed(p.address), "recipient": indexed(p.address), "amount0": p.uint256, "amount1": p.uint256, "paid0": p.uint256, "paid1": p.uint256}),
    IncreaseObservationCardinalityNext: event("0xac49e518f90a358f652e4400164f05a5d8f7e35e7747279bc3a93dbf584e125a", {"observationCardinalityNextOld": p.uint16, "observationCardinalityNextNew": p.uint16}),
    Initialize: event("0x98636036cb66a9c19a37435efc1e90142190214e8abeb821bdba3f2990dd4c95", {"sqrtPriceX96": p.uint160, "tick": p.int24}),
    Mint: event("0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde", {"sender": p.address, "owner": indexed(p.address), "tickLower": indexed(p.int24), "tickUpper": indexed(p.int24), "amount": p.uint128, "amount0": p.uint256, "amount1": p.uint256}),
    SetFeeProtocol: event("0x973d8d92bb299f4af6ce49b52a8adb85ae46b9f214c4c4fc06ac77401237b133", {"feeProtocol0Old": p.uint8, "feeProtocol1Old": p.uint8, "feeProtocol0New": p.uint8, "feeProtocol1New": p.uint8}),
    Swap: event("0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67", {"sender": indexed(p.address), "recipient": indexed(p.address), "amount0": p.int256, "amount1": p.int256, "sqrtPriceX96": p.uint160, "liquidity": p.uint128, "tick": p.int24}),
}

export const functions = {
    burn: fun("0xa34123a7", {"tickLower": p.int24, "tickUpper": p.int24, "amount": p.uint128}, {"amount0": p.uint256, "amount1": p.uint256}),
    collect: fun("0x4f1eb3d8", {"recipient": p.address, "tickLower": p.int24, "tickUpper": p.int24, "amount0Requested": p.uint128, "amount1Requested": p.uint128}, {"amount0": p.uint128, "amount1": p.uint128}),
    collectProtocol: fun("0x85b66729", {"recipient": p.address, "amount0Requested": p.uint128, "amount1Requested": p.uint128}, {"amount0": p.uint128, "amount1": p.uint128}),
    factory: fun("0xc45a0155", {}, p.address),
    fee: fun("0xddca3f43", {}, p.uint24),
    feeGrowthGlobal0X128: fun("0xf3058399", {}, p.uint256),
    feeGrowthGlobal1X128: fun("0x46141319", {}, p.uint256),
    flash: fun("0x490e6cbc", {"recipient": p.address, "amount0": p.uint256, "amount1": p.uint256, "data": p.bytes}, ),
    increaseObservationCardinalityNext: fun("0x32148f67", {"observationCardinalityNext": p.uint16}, ),
    initialize: fun("0xf637731d", {"sqrtPriceX96": p.uint160}, ),
    liquidity: fun("0x1a686502", {}, p.uint128),
    maxLiquidityPerTick: fun("0x70cf754a", {}, p.uint128),
    mint: fun("0x3c8a7d8d", {"recipient": p.address, "tickLower": p.int24, "tickUpper": p.int24, "amount": p.uint128, "data": p.bytes}, {"amount0": p.uint256, "amount1": p.uint256}),
    observations: fun("0x252c09d7", {"index": p.uint256}, {"blockTimestamp": p.uint32, "tickCumulative": p.int56, "secondsPerLiquidityCumulativeX128": p.uint160, "initialized": p.bool}),
    observe: fun("0x883bdbfd", {"secondsAgos": p.array(p.uint32)}, {"tickCumulatives": p.array(p.int56), "secondsPerLiquidityCumulativeX128s": p.array(p.uint160)}),
    positions: fun("0x514ea4bf", {"key": p.bytes32}, {"_liquidity": p.uint128, "feeGrowthInside0LastX128": p.uint256, "feeGrowthInside1LastX128": p.uint256, "tokensOwed0": p.uint128, "tokensOwed1": p.uint128}),
    protocolFees: fun("0x1ad8b03b", {}, {"token0": p.uint128, "token1": p.uint128}),
    setFeeProtocol: fun("0x8206a4d1", {"feeProtocol0": p.uint8, "feeProtocol1": p.uint8}, ),
    slot0: fun("0x3850c7bd", {}, {"sqrtPriceX96": p.uint160, "tick": p.int24, "observationIndex": p.uint16, "observationCardinality": p.uint16, "observationCardinalityNext": p.uint16, "feeProtocol": p.uint8, "unlocked": p.bool}),
    snapshotCumulativesInside: fun("0xa38807f2", {"tickLower": p.int24, "tickUpper": p.int24}, {"tickCumulativeInside": p.int56, "secondsPerLiquidityInsideX128": p.uint160, "secondsInside": p.uint32}),
    swap: fun("0x128acb08", {"recipient": p.address, "zeroForOne": p.bool, "amountSpecified": p.int256, "sqrtPriceLimitX96": p.uint160, "data": p.bytes}, {"amount0": p.int256, "amount1": p.int256}),
    tickBitmap: fun("0x5339c296", {"wordPosition": p.int16}, p.uint256),
    tickSpacing: fun("0xd0c93a7c", {}, p.int24),
    ticks: fun("0xf30dba93", {"tick": p.int24}, {"liquidityGross": p.uint128, "liquidityNet": p.int128, "feeGrowthOutside0X128": p.uint256, "feeGrowthOutside1X128": p.uint256, "tickCumulativeOutside": p.int56, "secondsPerLiquidityOutsideX128": p.uint160, "secondsOutside": p.uint32, "initialized": p.bool}),
    token0: fun("0x0dfe1681", {}, p.address),
    token1: fun("0xd21220a7", {}, p.address),
}

export class Contract extends ContractBase {

    factory() {
        return this.eth_call(functions.factory, {})
    }

    fee() {
        return this.eth_call(functions.fee, {})
    }

    feeGrowthGlobal0X128() {
        return this.eth_call(functions.feeGrowthGlobal0X128, {})
    }

    feeGrowthGlobal1X128() {
        return this.eth_call(functions.feeGrowthGlobal1X128, {})
    }

    liquidity() {
        return this.eth_call(functions.liquidity, {})
    }

    maxLiquidityPerTick() {
        return this.eth_call(functions.maxLiquidityPerTick, {})
    }

    observations(index: ObservationsParams["index"]) {
        return this.eth_call(functions.observations, {index})
    }

    observe(secondsAgos: ObserveParams["secondsAgos"]) {
        return this.eth_call(functions.observe, {secondsAgos})
    }

    positions(key: PositionsParams["key"]) {
        return this.eth_call(functions.positions, {key})
    }

    protocolFees() {
        return this.eth_call(functions.protocolFees, {})
    }

    slot0() {
        return this.eth_call(functions.slot0, {})
    }

    snapshotCumulativesInside(tickLower: SnapshotCumulativesInsideParams["tickLower"], tickUpper: SnapshotCumulativesInsideParams["tickUpper"]) {
        return this.eth_call(functions.snapshotCumulativesInside, {tickLower, tickUpper})
    }

    tickBitmap(wordPosition: TickBitmapParams["wordPosition"]) {
        return this.eth_call(functions.tickBitmap, {wordPosition})
    }

    tickSpacing() {
        return this.eth_call(functions.tickSpacing, {})
    }

    ticks(tick: TicksParams["tick"]) {
        return this.eth_call(functions.ticks, {tick})
    }

    token0() {
        return this.eth_call(functions.token0, {})
    }

    token1() {
        return this.eth_call(functions.token1, {})
    }
}

/// Event types
export type BurnEventArgs = EParams<typeof events.Burn>
export type CollectEventArgs = EParams<typeof events.Collect>
export type CollectProtocolEventArgs = EParams<typeof events.CollectProtocol>
export type FlashEventArgs = EParams<typeof events.Flash>
export type IncreaseObservationCardinalityNextEventArgs = EParams<typeof events.IncreaseObservationCardinalityNext>
export type InitializeEventArgs = EParams<typeof events.Initialize>
export type MintEventArgs = EParams<typeof events.Mint>
export type SetFeeProtocolEventArgs = EParams<typeof events.SetFeeProtocol>
export type SwapEventArgs = EParams<typeof events.Swap>

/// Function types
export type BurnParams = FunctionArguments<typeof functions.burn>
export type BurnReturn = FunctionReturn<typeof functions.burn>

export type CollectParams = FunctionArguments<typeof functions.collect>
export type CollectReturn = FunctionReturn<typeof functions.collect>

export type CollectProtocolParams = FunctionArguments<typeof functions.collectProtocol>
export type CollectProtocolReturn = FunctionReturn<typeof functions.collectProtocol>

export type FactoryParams = FunctionArguments<typeof functions.factory>
export type FactoryReturn = FunctionReturn<typeof functions.factory>

export type FeeParams = FunctionArguments<typeof functions.fee>
export type FeeReturn = FunctionReturn<typeof functions.fee>

export type FeeGrowthGlobal0X128Params = FunctionArguments<typeof functions.feeGrowthGlobal0X128>
export type FeeGrowthGlobal0X128Return = FunctionReturn<typeof functions.feeGrowthGlobal0X128>

export type FeeGrowthGlobal1X128Params = FunctionArguments<typeof functions.feeGrowthGlobal1X128>
export type FeeGrowthGlobal1X128Return = FunctionReturn<typeof functions.feeGrowthGlobal1X128>

export type FlashParams = FunctionArguments<typeof functions.flash>
export type FlashReturn = FunctionReturn<typeof functions.flash>

export type IncreaseObservationCardinalityNextParams = FunctionArguments<typeof functions.increaseObservationCardinalityNext>
export type IncreaseObservationCardinalityNextReturn = FunctionReturn<typeof functions.increaseObservationCardinalityNext>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type LiquidityParams = FunctionArguments<typeof functions.liquidity>
export type LiquidityReturn = FunctionReturn<typeof functions.liquidity>

export type MaxLiquidityPerTickParams = FunctionArguments<typeof functions.maxLiquidityPerTick>
export type MaxLiquidityPerTickReturn = FunctionReturn<typeof functions.maxLiquidityPerTick>

export type MintParams = FunctionArguments<typeof functions.mint>
export type MintReturn = FunctionReturn<typeof functions.mint>

export type ObservationsParams = FunctionArguments<typeof functions.observations>
export type ObservationsReturn = FunctionReturn<typeof functions.observations>

export type ObserveParams = FunctionArguments<typeof functions.observe>
export type ObserveReturn = FunctionReturn<typeof functions.observe>

export type PositionsParams = FunctionArguments<typeof functions.positions>
export type PositionsReturn = FunctionReturn<typeof functions.positions>

export type ProtocolFeesParams = FunctionArguments<typeof functions.protocolFees>
export type ProtocolFeesReturn = FunctionReturn<typeof functions.protocolFees>

export type SetFeeProtocolParams = FunctionArguments<typeof functions.setFeeProtocol>
export type SetFeeProtocolReturn = FunctionReturn<typeof functions.setFeeProtocol>

export type Slot0Params = FunctionArguments<typeof functions.slot0>
export type Slot0Return = FunctionReturn<typeof functions.slot0>

export type SnapshotCumulativesInsideParams = FunctionArguments<typeof functions.snapshotCumulativesInside>
export type SnapshotCumulativesInsideReturn = FunctionReturn<typeof functions.snapshotCumulativesInside>

export type SwapParams = FunctionArguments<typeof functions.swap>
export type SwapReturn = FunctionReturn<typeof functions.swap>

export type TickBitmapParams = FunctionArguments<typeof functions.tickBitmap>
export type TickBitmapReturn = FunctionReturn<typeof functions.tickBitmap>

export type TickSpacingParams = FunctionArguments<typeof functions.tickSpacing>
export type TickSpacingReturn = FunctionReturn<typeof functions.tickSpacing>

export type TicksParams = FunctionArguments<typeof functions.ticks>
export type TicksReturn = FunctionReturn<typeof functions.ticks>

export type Token0Params = FunctionArguments<typeof functions.token0>
export type Token0Return = FunctionReturn<typeof functions.token0>

export type Token1Params = FunctionArguments<typeof functions.token1>
export type Token1Return = FunctionReturn<typeof functions.token1>

