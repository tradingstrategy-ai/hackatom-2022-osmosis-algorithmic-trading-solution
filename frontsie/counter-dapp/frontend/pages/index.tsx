import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";

const Home: NextPage = () => {
  const { count, error, increase } = useCount();
  const [isLoading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      <Head>
        <title>Algosm</title>
        <meta name="description" content="Make profit on Osmosis with algorithmic trading" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Algosm</h1>

        <p className="lead">
            Automated non-custodial active trading strategies for Osmosis.
            <br/>
            Earn sustainable profits with algorithmic trading.
        </p>

          <h2>Strategies</h2>

          <div className="vault">

              <div className="left">
                  <h3>ATOM/OSMO mean reversion</h3>
                  <p>Trades: <span className="value">ATOM/OSMO pair</span></p>
                  <p>Profits kept in: <span className="value">OSMO</span></p>
                  <p>Current returns: <span className="value">0%</span></p>
                  <p>Historical APY: <span className="value">12%</span></p>
                  <p>Description: <br/>
                      <span className="value">
                          The strategy trades ATOM/OSMO pair on Osmosis decentralised exchange.
                          Depending on slow and fast moving exponential price average the strategy will flip its position between
                          these two tokens. The strategy is suitable for investors who look to optimise
                          gains in ATOM or OSMO against each other.
                      </span>
                  </p>
              </div>

              <div className="right">
                  <a className="btn" href="/strategy">
                      Invest
                  </a>

                  <a className="btn" href="/strategy">
                      Performance
                  </a>
              </div>
          </div>

          <div className="vault">
              <div className="left">
                  <h3>Ecosystem momentum</h3>
                  <p>Trades: <span className="value">All Osmosis pools</span></p>
                  <p>Profits kept in: <span className="value">DAI</span></p>
                  <p>Description: <span className="value">Buys fastest raising Osmosis tokens.</span></p>
              </div>

              <div className="right">
                  <p className="status">
                      Soon
                  </p>
              </div>
          </div>

          <div className="blurpsie">
              <h2>Why Algosm?</h2>

              <p>
                  Decentralised finance ecosystem needs to mature beyond yield farming.
              </p>

              <ul>
                  <li>Easy access directly from Cosmos wallet</li>
                  <li>
                      Strategy execution on off-chain oracles enables more powerful strategies that
                      could be achieved on smart contracts alone.
                      Historical price data is not available on-chain.
                      A trading decision can evaluate hundreds of megabytes of data.
                  </li>
                  <li>
                      Directional, slow moving, trading strategies that are different from liquidity provision or high-frequency trading.
                  </li>
                  <li>Osmosis gain real volume from directional trades</li>
                  <li>
                      Profits are long term sustainable unlike in yield farming.
                  </li>
                  <li>
                      Strategies are developed in Python scripting instead of CosmWasm,
                      making them safer and more accessible than Solidity or Rust smart contract programming.
                  </li>
              </ul>
          </div>

          <div className="blurpsie">
              <h2>Technology</h2>

              <ul>
                  <li>Osmosis integration - create trading strategies for all Osmosis pools</li>
                  <li>CosmWasm based vault smart contract</li>
                  <li>Swap indexer on TheGraph Osmosis</li>
                  <li>A strategy engine and oracle by Trading Strategy</li>
                  <li>Integration with Keplr wallet with quality user experience</li>
              </ul>
          </div>

          <div className="blurpsie footer">
              <a href="https://github.com/tradingstrategy-ai/hackatom-2022-osmosis-algorithmic-trading-solution">
                  <img
                    alt=""
                    src="https://uploads-ssl.webflow.com/623a0c9828949e55356286f9/623b6219f56a591d0de5e038_coolicon-1.svg"/>
              </a>
          </div>

      </main>
    </div>
  );
};

const withNoSSR = (Component: React.FunctionComponent) => dynamic(
    () => Promise.resolve(Component),
    { ssr: false },
);


export default withNoSSR(Home);
