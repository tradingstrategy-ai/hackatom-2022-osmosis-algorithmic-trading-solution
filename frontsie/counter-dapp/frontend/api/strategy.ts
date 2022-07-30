import useSWR from "swr";
import { getAddress, getClient, getSigningClient } from "../lib/client";
import { getContractAddr } from "../lib/state";

export const getCount = async () => {
  const client = await getClient();
  return await client.queryContractSmart(getContractAddr(), { get_count: {} });
};

export const increase = async () => {
  const client = await getSigningClient();
  return await client.execute(
    await getAddress(),
    getContractAddr(),
    { increment: {} },
    "auto"
  );
};


export const useVaultBalances = () => {
  const { data, error, mutate } = useSWR("/counter/vault-balances", getCount);
  return {
    count: data?.count,
    error,
    increase: () => mutate(increase),
  };
};


export const getWalletStatus = async() => {
    const client = await getSigningClient();
    const address = await getAddress();
    const walletBalance = await client.getBalance(address, "uosmo");
    const contractAddress = await getContractAddr();
    const vaultBalances = await client.queryContractSmart(getContractAddr(), { get_vault_balances: {} });
    return {
        address,
        walletBalance,
        contractAddress,
        vaultBalances
    }
}

export const deposit = async(contractAddress: string, amount: string) => {

    if(!amount) {
        throw new Error("Amount is bad");
    }

    const client = await getSigningClient();
    const address = await getAddress();
    const denom = "uosmo";
    const sendResult = await client.sendTokens(
        address,
        contractAddress,
        [
            {
                denom: denom,
                amount: amount,
            },
        ],
        {
            amount: [{ denom: "ousmo", amount: "500" }],
            gas: "200000",
        },
    );
    return sendResult;
}