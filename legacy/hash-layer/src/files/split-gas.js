import "./load-env.js";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import SuiClient from "./SuiClient.js";
async function splitGas() {
    const keypar = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC, "m/44'/784'/0'/0'/0'");
    const address = keypar.getPublicKey().toSuiAddress();
    console.log(`Wallet address: ${address}`);
    const client = new SuiClient(process.env.RPC_PROVIDER);
    // Get current gas coins
    const coins = await client.client.getCoins({ owner: address });
    console.log(`Current gas coins: ${coins.data.length}`);
    if (coins.data.length === 0) {
        console.error("No gas coins available!");
        return;
    }
    // Split the largest coin into 10 smaller coins
    const largestCoin = coins.data.reduce((prev, current) => Number(current.balance) > Number(prev.balance) ? current : prev);
    console.log(`\nSplitting coin ${largestCoin.coinObjectId.slice(0, 16)}...`);
    console.log(`Balance: ${Number(largestCoin.balance) / 1e9} SUI`);
    const tx = new Transaction();
    // Split into 10 coins of 1 SUI each
    const splitAmount = 1_000_000_000; // 1 SUI in MIST
    tx.splitCoins(tx.gas, [
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
        splitAmount,
    ]);
    tx.setGasPrice(495);
    tx.setGasBudget(10_000_000); // Higher budget for split operation
    console.log("\nSubmitting split transaction...");
    try {
        const result = await client.executeTransaction(tx, keypar);
        console.log(`✅ Success! Digest: ${result.digest}`);
        console.log(`\nNow you have multiple gas coins that can be used in parallel.`);
    }
    catch (err) {
        console.error("❌ Error:", err);
    }
}
splitGas().catch(console.error);
//# sourceMappingURL=split-gas.js.map