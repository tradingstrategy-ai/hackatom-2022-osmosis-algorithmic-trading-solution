import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";

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
            Sustainable profits on Osmosis with non-custodial active trading strategies
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
                          Low risk strategy that switches between ATOM and OSMO depending on which token is enjoying momentum.
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
                  <p>Trades: All Osmosis pools</p>
                  <p>Profits kept in: DAI</p>
                  <p>Description: Buys fastest raising Osmosis tokens.</p>
              </div>

              <div className="right">
                  <p className="status">
                      Soon
                  </p>
              </div>
          </div>

        <p
          className={
            isLoading ? [styles.count, styles.pulse].join(" ") : styles.count
          }
        >
          {count === undefined ? "?" : count}
        </p>

        {error ? <p className={styles.error}>Error: {error.message}</p> : <></>}

        <div className={styles.grid}>
          <a
            className={styles.card}
            onClick={async () => {
              setLoading(true);
              await increase();
              setLoading(false);
            }}
          >
            <h2>＋ Increase Counter</h2>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
