import type { NextPage } from "next";
import Head from "next/head";
import {useRef, useState} from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";
import {deposit, getWalletStatus} from "../api/strategy";

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

              <h3>Portfolio benchmark</h3>

              <p>Strategy performance benchmarked agaisnt buy-and-hold ATOM and buy-and-hold OSMO.</p>

              <img src="/benchmark.png" />

          </div>

          <div className="blurpsie">
              <h2>Strategy execution and source code</h2>

              <h3>Execution status</h3>

              <div class="info-pane">
                  <table>
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
                  </table>
              </div>

              <h3>Source code</h3>

              <p>This source code is executed by all strategy oracles.</p>

          </div>

      </main>
    </div>
  );
};

export default Strategy;
