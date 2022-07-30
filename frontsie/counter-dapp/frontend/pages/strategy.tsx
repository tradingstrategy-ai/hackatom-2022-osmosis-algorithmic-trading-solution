import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";
import {getWalletStatus} from "../api/strategy";

const Strategy: NextPage = () => {

    const { count, error, increase } = useCount();

    const [isLoading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const [currentBalance, setBalance] = useState(false);
    const [currentInvesment, setInvestment] = useState(false);
    const [currentAddress, setAddress] = useState("");
    const [currentWalletBalance, setWalletBalance] = useState("");


    async function onConnect() {
        console.log("Connecting wallet");
        const walletStatus = await getWalletStatus();
        setAddress(walletStatus.address);
        setWalletBalance(walletStatus.walletBalance.amount);
        console.log("Wallet balance is", walletStatus.walletBalance);
        setConnected(true);
    }

  return (
    <div className={styles.container}>
      <Head>
        <title>ATOM/OSMO mean reversion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="heading-strategy">ATOM/OSMO mean reversion strategy</h1>

          <div className="vault">
              <div className="left">

                  <label></label>

                  <p>
                      Your account: {connected ? currentAddress : "-"}
                  </p>


                  <p>
                      Currently investment: 0 OSMO
                  </p>

                  <p>
                      Your profit: {connected ? "" : ""}
                  </p>

                  <p>
                      In wallet: {connected ? currentWalletBalance : "-"}
                  </p>

              </div>

              <div className="right">

                  <button className="btn" disabled={connected} onClick={onConnect}>
                      Connect wallet
                  </button>

                  <button className="btn" disabled={!connected}>
                      Deposit OSMO
                  </button>

                  <button className="btn" disabled={!connected}>
                      Withdraw
                      tokens
                  </button>
              </div>
          </div>

          <h2>Current performance</h2>

          <p>Not enough data</p>

          <h2>Backtested performance</h2>

          <p>Not enough data</p>

          <h2>Strategy source code</h2>

          <p>Not enough data</p>

      </main>
    </div>
  );
};

export default Strategy;
