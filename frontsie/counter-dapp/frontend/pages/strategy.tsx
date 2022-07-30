import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useCount } from "../api/counter";
import styles from "../styles/Home.module.css";

const Strategy: NextPage = () => {
  const { count, error, increase } = useCount();
  const [isLoading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      <Head>
        <title>Strategy example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Strategy example</h1>
      </main>
    </div>
  );
};

export default Strategy;
