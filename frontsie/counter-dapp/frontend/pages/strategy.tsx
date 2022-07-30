import type { NextPage } from "next";
import dynamic from 'next/dynamic';
import Head from "next/head";
import {useRef, useState} from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";
import {deposit, getWalletStatus} from "../api/strategy";
import Image from "next/image";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNightBlue } from 'react-syntax-highlighter/dist/esm/styles/hljs';
 //import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';

// https://blog.bitsrc.io/using-non-ssr-friendly-components-with-next-js-916f38e8992c
const isSSR = () => typeof window === 'undefined';

const codeString = `

# Strategy thinking specific parameter
#

# Rebalance every 8h
trading_strategy_cycle = CycleDuration.cycle_8h

# How much of the cash to put on a single trade
position_size = 0.90

# 14 days
slow_ema_candle_count = 14*24

# 5 days
fast_ema_candle_count = 5*24

# How many candles to extract from the dataset once
batch_size = slow_ema_candle_count * 2

# Range of backtesting and synthetic data generation.
# Because we are using synthetic data actual dates do not really matter -
# only the duration

# Osmosis launched
start_at = datetime.datetime(2021, 12, 25)

# When our data ends
end_at = datetime.datetime(2022, 4, 1)

from typing import List, Dict

from pandas_ta.overlap import ema

from tradingstrategy.universe import Universe

from tradeexecutor.state.visualisation import PlotKind
from tradeexecutor.state.trade import TradeExecution
from tradeexecutor.strategy.pricing_model import PricingModel
from tradeexecutor.strategy.pandas_trader.position_manager import PositionManager
from tradeexecutor.state.state import State


def decide_trades(
        timestamp: pd.Timestamp,
        universe: Universe,
        state: State,
        pricing_model: PricingModel,
        cycle_debug_data: Dict) -> List[TradeExecution]:
    """The brain function to decide the trades on each trading strategy cycle."""

    # The pair we are trading
    pair = universe.pairs.get_single()

    assert pair.token0_symbol == "ATOM", f"Got pair {pair}"
    assert pair.token1_symbol == "OSMO", f"Got pair {pair}"

    # How much cash we have in the hand
    cash = state.portfolio.get_current_cash()

    # Get OHLCV candles for our trading pair as Pandas Dataframe.
    # We could have candles for multiple trading pairs in a different strategy,
    # but this strategy only operates on single pair candle.
    # We also limit our sample size to N latest candles to speed up calculations.
    candles: pd.DataFrame = universe.candles.get_single_pair_data(timestamp, sample_count=batch_size)

    # We have data for open, high, close, etc.
    # We only operate using candle close values in this strategy.
    close = candles["close"]

    # Calculate exponential moving averages based on slow and fast sample numbers.
    # https://github.com/twopirllc/pandas-ta
    # https://github.com/twopirllc/pandas-ta/blob/bc3b292bf1cc1d5f2aba50bb750a75209d655b37/pandas_ta/overlap/ema.py#L7
    slow_ema_series = ema(close, length=slow_ema_candle_count)
    fast_ema_series = ema(close, length=fast_ema_candle_count)

    if slow_ema_series is None or fast_ema_series is None:
        # Cannot calculate EMA, because
        # not enough samples in backtesting
        return []

    slow_ema = slow_ema_series.iloc[-1]
    fast_ema = fast_ema_series.iloc[-1]

    # Get the last close price from close time series
    # that's Pandas's Series object
    # https://pandas.pydata.org/docs/reference/api/pandas.Series.iat.html
    current_price = close.iloc[-1]

    # List of any trades we decide on this cycle.
    # Because the strategy is simple, there can be
    # only zero (do nothing) or 1 (open or close) trades
    # decides
    trades = []

    # Create a position manager helper class that allows us easily to create
    # opening/closing trades for different positions
    position_manager = PositionManager(timestamp, universe, state, pricing_model)

    if current_price >= slow_ema:
        # Entry condition:
        # Close price is higher than the slow EMA
        if not position_manager.is_any_open():
            buy_amount = cash * position_size
            trades += position_manager.open_1x_long(pair, buy_amount)
    elif slow_ema >= fast_ema:
        # Exit condition:
        # Fast EMA crosses slow EMA
        if position_manager.is_any_open():
            trades += position_manager.close_all()

    # Visualize strategy
    # See available Plotly colours here
    # https://community.plotly.com/t/plotly-colours-list/11730/3?u=miohtama
    visualisation = state.visualisation
    visualisation.plot_indicator(timestamp, "Slow EMA", PlotKind.technical_indicator_on_price, slow_ema, colour="darkblue")
    visualisation.plot_indicator(timestamp, "Fast EMA", PlotKind.technical_indicator_on_price, fast_ema, colour="#003300")

    return trades
`;

const Strategy: NextPage = () => {

    const inputRef = useRef(null);

    const { count, error, increase } = useCount();

    const [isLoading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const [currentBalance, setBalance] = useState(false);
    const [currentInvesment, setInvestment] = useState(false);
    const [currentAddress, setAddress] = useState("");
    const [contractAddress, setContractAddress] = useState("");
    const [currentWalletBalance, setWalletBalance] = useState("");
    const [currentVaultOSMOBalance, setVaultOSMOBalance] = useState("");

    const [investError, setInvestError] = useState("");
    const [investResult, setInvestResult] = useState("");

    const [busy, setBusy] = useState(false);

    // After we have good wallet connection,
    // refresh UI
    async function updateUI() {
        const walletStatus = await getWalletStatus();
        setAddress(walletStatus.address);
        setContractAddress(walletStatus.contractAddress);
        let happyBalance = parseFloat(walletStatus.walletBalance.amount) / 1_000_000;
        setWalletBalance(happyBalance.toLocaleString("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " OSMO");
        console.log("Wallet balance is", walletStatus.walletBalance);
        console.log("Vault balances are", walletStatus.vaultBalances);

        if(walletStatus.vaultBalances.balances.length > 0) {
            happyBalance = parseFloat(walletStatus.vaultBalances.balances[0].amount) / 1_000_000;
            setVaultOSMOBalance(happyBalance.toLocaleString("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " OSMO");
        } else {
            setVaultOSMOBalance("0 OSMO");
        }

    }

    async function onConnect() {
        console.log("Connecting wallet");
        setConnected(true);
        updateUI();
    }

    async function onDeposit() {

        setBusy(true);

        setInvestResult("");

        let val = inputRef.current.value;
        if(!val) {
            setInvestError("Enter OSMO amount to invest");
            return;
        }

        val = parseFloat(val) * 1_000_000;
        val = parseInt(val).toString();
        console.log("Depositing", contractAddress, val, "uosmo");
        try {
            const result = await deposit(contractAddress, val);
            console.log("TX result", result);
            if(result.code === 0) {
                setInvestResult("Deposit complete")
            }
        } catch(e) {
            console.error(e);
            setInvestError(e.toString());
        }

        updateUI();

        inputRef.current.value = "";

        setBusy(false);
    }

      const handleChange = event => {
        setMessage(event.target.value);
        console.log('value is:', event.target.value);
      };

  return (
    <div className={styles.container}>
      <Head>
        <title>ATOM/OSMO mean reversion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="heading-strategy">ATOM/OSMO mean reversion strategy</h1>

          <div className="vault vault-wide">
              <div className="left">

                  <label>Amount to invest (OSMO):</label>

                  {investError && <p className="error">
                      {investError}
                  </p>}

                  {investResult && <p className="success">
                      {investResult}
                  </p>}

                  <input
                    ref={inputRef}
                    type="text"
                    id="value"
                    name="value"
                    className="value"
                    disabled={!connected}
                  />

                  <p>
                      Your account: <br/><span className="value value-address">{connected ? currentAddress : "-"}</span>
                  </p>

                  <p>
                      Strategy vault address: <br/><span className="value value-address">{connected ? contractAddress : "-"}</span>
                  </p>

                  <p>
                      Your investment: <span className="value">{connected ? currentVaultOSMOBalance : "-"}</span>
                  </p>

                  <p>
                      Vault TVL: <span className="value">{connected ? currentVaultOSMOBalance : "-"}</span>
                  </p>

                  <p>
                      Lifetime profit: <span className="value">{connected ? "0%" : "-"}</span>
                  </p>

                  <p>
                      Wallet balance: <span className="value">{connected ? currentWalletBalance : "-"}</span>
                  </p>

                  {!connected && <p class="connect-info">
                      Connect your Keplr wallet to invest and display current profit.
                  </p>}

              </div>

              <div className="right">

                  <button className="btn" disabled={connected || busy} onClick={onConnect}>
                      Connect wallet
                  </button>

                  <button className="btn" disabled={!connected || busy} onClick={onDeposit}>
                      Deposit OSMO
                  </button>

                  <button className="btn" disabled={!connected || busy}>
                      Withdraw
                      tokens
                  </button>

                  <div className="loader-wrapper">
                    {busy && <span className="loader">..</span>}
                  </div>
              </div>
          </div>

          <div className="blurpsie">
              <h2>About this strategy</h2>

              <p>
                  The strategy trades ATOM/OSMO pair on Osmosis decentralised exchange.
                  Depending on slow and fast moving exponential price average the strategy will flip its position between
                  these two tokens. The strategy is suitable for investors who look to optimise
                  gains in ATOM or OSMO against each other.
              </p>
          </div>

          <div className="blurpsie">
              <h2>Current performance</h2>

              <p>
                 <strong>Not enough data</strong>.
              </p>
              <p>
                 This strategy has not been running for enough days to gather any meaningful live trading performance analytics.
                 Strategies may do trades weekly or monthly and it will take several rebalance cycles to refelct the true performance.
              </p>
          </div>

          <div className="blurpsie">
              <h2>Backtested performance</h2>

              <p>Backtesting has been performed on historical Osmosis trading data.</p>

              <h3>Backtesting key metrics</h3>

              <div className="info-pane">
                  <table>
                      <tbody>
                          <tr>
                              <th>Backtesting period</th>
                              <td>2021-12-25 - 2022-07-29</td>
                          </tr>

                          <tr>
                              <th>Annualised profit</th>
                              <td>10%</td>
                          </tr>

                          <tr>
                              <th>Maximum drawdown</th>
                              <td>Not available yet</td>
                          </tr>

                          <tr>
                              <th>Trade win rate</th>
                              <td>100%</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <h3>Portfolio benchmark</h3>

              <p>Strategy performance benchmarked agaisnt buy-and-hold ATOM and buy-and-hold OSMO.</p>

              <Image src="/benchmark.png" width={960} height={800}  />

          </div>

          <div className="blurpsie">
              <h2>Strategy execution and source code</h2>

              <h3>Execution status</h3>

              <div className="info-pane">
                  <table>
                      <tbody>
                          <tr>
                              <th>Oracles running</th>
                              <td>1</td>
                          </tr>

                          <tr>
                              <th>Oracles registered</th>
                              <td>1</td>
                          </tr>

                          <tr>
                              <th>Last trade</th>
                              <td>Not available yet</td>
                          </tr>

                          <tr>
                              <th>Vault smart contract</th>
                              <td>osmo17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgs5yczr8</td>
                          </tr>

                          <tr>
                              <th>Source code IPFS</th>
                              <td>Not available yet</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <h3>Source code</h3>

              <p>This strategy  code is executed and verified by all strategy oracles.</p>

            <pre>
              {codeString}
            </pre>

          </div>

      </main>
    </div>
  );
};



//export default Strategy;

const withNoSSR = (Component: React.FunctionComponent) => dynamic(
    () => Promise.resolve(Component),
    { ssr: false },
);

export default withNoSSR(Strategy);
