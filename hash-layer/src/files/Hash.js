import "./load-env.js";
import NFTbuilder from "./NFTbuilder.js";
import NFTstore from "./NFTstore.js";
import SuiClient from "./SuiClient.js";
import Miner from "./Miner.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
import TXService from "./TXService.js";
class Hash {
    miner;
    builder;
    store;
    client;
    chain;
    adapter;
    bsc;
    tx;
    constructor() {
        this.bsc = new BSC();
        this.builder = new NFTbuilder();
        this.store = new NFTstore();
        this.client = new SuiClient(process.env.RPC_PROVIDER);
        this.adapter = new Adapter();
        this.chain = new Chain(this.client, this.adapter);
        this.miner = new Miner(this.bsc, this.chain);
        this.tx = new TXService(this.client, process.env.MNEMONIC, process.env.HASH_CONTRACT);
    }
    async run() {
        while (true) {
            try {
                const result = await this.miner.start();
                if (result) {
                    console.log("༼ つ ◕_◕ ༽つ" + result?.hash, result?.nonce);
                    const tx = await this.handleMiningResult(result);
                    console.log("Block submitted:", tx);
                }
            }
            catch (err) {
                console.error("Snapshot error:", err?.message || err);
            }
        }
    }
    async handleMiningResult(result) {
        const { nonce } = result;
        try {
            const tx = await this.tx.sumbitBlock(nonce, [], new TextEncoder().encode(process.env.NFT_URL || ""), process.env.CHAIN_OBJECT || "", process.env.BALANCE_KEEPER || "");
            //finalization
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return tx;
        }
        catch (err) {
            if (err?.code === -32002) {
                console.warn("Rejected by validators (object conflict). Wait for next snapshot.");
            }
            else {
                console.error("Submit block failed:", err?.message || err);
            }
        }
    }
}
const hash = new Hash();
hash.run();
//# sourceMappingURL=Hash.js.map