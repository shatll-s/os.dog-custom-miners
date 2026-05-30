import "./load-env.js";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import SuiClient from "./SuiClient.js";
async function checkWallet() {
    const keypar = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC, "m/44'/784'/0'/0'/0'");
    const address = keypar.getPublicKey().toSuiAddress();
    console.log(`Wallet address: ${address}`);
    const client = new SuiClient(process.env.RPC_PROVIDER);
    // Get balance
    const balance = await client.getBalance(address);
    console.log(`\nSUI Balance: ${Number(balance.totalBalance) / 1e9} SUI`);
    // Get all coins
    const coins = await client.client.getCoins({ owner: address });
    console.log(`\nTotal gas coins: ${coins.data.length}`);
    // Show details of each coin
    for (const coin of coins.data.slice(0, 10)) {
        console.log(`  Coin ${coin.coinObjectId.slice(0, 8)}...: ${Number(coin.balance) / 1e9} SUI`);
    }
    // Check for pending transactions
    try {
        const txs = await client.client.queryTransactionBlocks({
            filter: { FromAddress: address },
            options: { showEffects: true },
            limit: 5,
            order: 'descending'
        });
        console.log(`\n\nRecent transactions:`);
        for (const tx of txs.data) {
            const status = tx.effects?.status?.status || 'unknown';
            console.log(`  ${tx.digest.slice(0, 8)}...: ${status}`);
        }
    }
    catch (err) {
        console.error("Error checking transactions:", err);
    }
}
checkWallet().catch(console.error);
//# sourceMappingURL=check-wallet.js.map