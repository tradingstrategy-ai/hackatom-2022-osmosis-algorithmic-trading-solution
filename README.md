
<p align="center">
  <img width=100 height=100 src="./algosm-logo-black.png">
  <h1 align="center">Algosm</h1>
</p>


Algosm is a hackathon project for HackAtom Seoul 2022. Algosm does
non-custodial active trading strategies on Osmosis DEX using CosmWasm smart contract
and offchain trading algorithm oracles.

## Contents 

- Create ATOM/OSMO price candles in [analyse.ipynb](hackatom_2022/analyse.ipynb) and save as Parquet
- Read all Osmosis token swaps using hosted TheGraph API in [store_price.py](hackatom_2022/store_price.py) to CSV
- [Deployed Subgraph](https://thegraph.com/hosted-service/subgraph/miohtama/hackatom-2022)
- [Subgraph source code](https://github.com/miohtama/hackatom-2022)
- [CosmWasm smart contracts](./frontsie/counter-dapp/contracts)
- [Beaker based frontend](./frontsie/counter-dapp/frontend)

## How to run this demo

### Collect historical price data

Obtain raw Osmosis swap events using [subgraph](https://github.com/miohtama/hackatom-2022)

```shell
poetry install
python hackatom_2022/store_price.py
```

This will generate 600 MB `swaps.csv`.

### Create and examine OHLCV candle data

Use [OHLCV Jupyter Notebook](hackatom_2022/analyse.ipynb).

### Run backtests 

Use [backtest Jupyter Notebook](hackatom_2022/analyse.ipynb).

### Deploy contracts

Use [Beaker](frontsie/counter-dapp).

### Run frontend locally

Use [Vercel](frontsie/counter-dapp).

```shell
cd frontsie/counter-dapp/frontend
yarn dev
```

# Team

- [Mikko Ohtamaa](twitter.com/moo9000/)
- [Mike Purvis](https://twitter.com/mikedotexe)
- Teddy Knox
- Mykhailo Donchenko