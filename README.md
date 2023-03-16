# Uniswap v3 swaps to BigQuery

This sample squid indexes [Uniswap v3](https://etherscan.io/address/0x1f98431c8ad98523631ae4a59f267346ea31f984) swaps on Ethereum Mainnet. The squid listens to the `PoolCreated`
events to dynamically update the set of trading pools using the [factory contract](https://docs.subsquid.io/evm-indexing/factory-contracts/) pattern.
The output is written to Google BigQuery.

One can use this example as a template for scaffolding a new squid project with [`sqd init`](https://docs.subsquid.io/squid-cli/):

```bash
sqd init my-new-squid --template https://github.com/subsquid-labs/factory-example
```

## Prerequisites

- Node v16.x
- [Squid CLI](https://docs.subsquid.io/squid-cli/)

## Running 

Clone the repo and navigate to the root folder.

```bash
npm ci
sqd process
```
