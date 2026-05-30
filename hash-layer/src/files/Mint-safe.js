import './load-env.js';
import SuiClient from "./SuiClient.js";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
class MintSafe {
    client;
    keypar;
    constructor() {
        this.client = new SuiClient(process.env.RPC_PROVIDER);
        this.keypar = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC, "m/44'/784'/0'/0'/0'");
    }
    async run() {
        try {
            // Get all gas coins
            const address = this.keypar.getPublicKey().toSuiAddress();
            const coins = await this.client.client.getCoins({ owner: address });
            console.log("Available gas coins:");
            coins.data.forEach((coin, i) => {
                const balance = Number(coin.balance) / 1_000_000_000;
                console.log(`  ${i}: ${coin.coinObjectId.slice(0, 10)}... - ${balance} SUI`);
            });
            // Find smallest coin that's not the locked one
            const lockedCoin = "0x4e18ddd09248b696a32ef2b655985121dc997ab16242fca21d47f869a279b036";
            const availableCoins = coins.data.filter(c => c.coinObjectId !== lockedCoin);
            if (availableCoins.length === 0) {
                throw new Error("No available gas coins!");
            }
            // Use the first available coin (not the locked one)
            const gasPayment = availableCoins[0];
            console.log(`\nUsing gas coin: ${gasPayment.coinObjectId.slice(0, 10)}... (${Number(gasPayment.balance) / 1_000_000_000} SUI)`);
            const tx = new Transaction();
            tx.moveCall({
                target: `${process.env.HASH_CONTRACT}::hash_layer::mint`,
                arguments: [
                    tx.object(process.env.MINING_CONTROLLER),
                    tx.object(process.env.BALANCE_KEEPER)
                ],
            });
            tx.setGasPrice(495);
            tx.setGasBudget(3500000);
            // Explicitly set which gas coin to use
            tx.setGasPayment([{
                    objectId: gasPayment.coinObjectId,
                    version: gasPayment.version,
                    digest: gasPayment.digest
                }]);
            const result = await this.client.client.signAndExecuteTransaction({
                signer: this.keypar,
                transaction: tx,
                options: {
                    showEffects: true,
                }
            });
            console.log("\n✅ Mint successful!");
            console.log("Transaction:", result.digest);
            console.log("Status:", result.effects?.status.status);
        }
        catch (err) {
            console.error("❌ Mint failed:", err.message || err);
        }
    }
}
const mint = new MintSafe();
mint.run();
//# sourceMappingURL=Mint-safe.js.map